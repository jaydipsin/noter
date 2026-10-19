import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormField, form, required, schema } from '@angular/forms/signals';
import { ApiNote, NotesService } from './notes.service';

type View = 'all' | 'pinned';

interface NoteFormModel {
  title: string;
  content: string;
}

interface Note extends ApiNote {
  preview: string;
  date: string;
  edited: string;
  collection: string;
  color: string;
  readTime: number;
  pinned: boolean;
}

@Component({
  imports: [FormField],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly notesService = inject(NotesService);
  protected readonly activeView = signal<View>('all');
  protected readonly searchQuery = signal('');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly isCreating = signal(false);
  protected readonly saveLabel = signal('Loading notes…');
  private readonly localPinned = signal(new Set<number>());
  protected readonly draft = signal<NoteFormModel>({ title: '', content: '' });
  protected readonly noteForm = form(this.draft, schema((note) => required(note.title)));

  protected readonly notes = computed(() => this.notesService.notesResource.value().map((note) => this.toViewNote(note)));
  protected readonly selectedNote = computed(() => this.notes().find((note) => note.id === this.selectedId()));
  protected readonly filteredNotes = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    return this.notes().filter((note) => {
      const inView = this.activeView() === 'all' || note.pinned;
      const matches = !query || `${note.title} ${note.preview} ${note.collection}`.toLowerCase().includes(query);
      return inView && matches;
    });
  });
  protected readonly pinnedCount = computed(() => this.notes().filter((note) => note.pinned).length);
  protected readonly wordCount = computed(() => {
    const content = this.draft().content.trim();
    return content ? content.split(/\s+/).length : 0;
  });
  protected readonly collections = [
    { name: 'Journal', color: '#e6a75d', count: 0 },
    { name: 'Work', color: '#7aa89d', count: 0 },
    { name: 'Life', color: '#c6817b', count: 0 },
    { name: 'Ideas', color: '#9886b8', count: 0 },
  ];

  constructor() {
    effect(() => {
      const notes = this.notes();
      const selected = this.selectedId();
      if (selected === null && notes.length > 0 && !this.isCreating()) {
        this.selectNote(notes[0].id);
      }
    });
  }

  protected selectNote(id: number): void {
    const note = this.notes().find((item) => item.id === id);
    if (!note) return;
    this.selectedId.set(id);
    this.isCreating.set(false);
    this.draft.set({ title: note.title, content: note.content });
    this.saveLabel.set('Saved from server');
  }

  protected showAllNotes(): void {
    this.activeView.set('all');
  }

  protected showPinnedNotes(): void {
    this.activeView.set('pinned');
    const current = this.selectedNote();
    if (current && !current.pinned) {
      const firstPinned = this.notes().find((note) => note.pinned);
      if (firstPinned) this.selectNote(firstPinned.id);
    }
  }

  protected selectCollection(collection: string): void {
    this.activeView.set('all');
    const first = this.notes().find((note) => note.collection === collection);
    if (first) this.selectNote(first.id);
  }

  protected updateSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected togglePin(): void {
    const note = this.selectedNote();
    if (!note) return;
    this.localPinned.update((pinned) => {
      const next = new Set(pinned);
      if (next.has(note.id)) next.delete(note.id);
      else next.add(note.id);
      return next;
    });
    this.saveLabel.set('Pin saved locally');
  }

  protected saveNote(): void {
    const id = this.selectedId();
    const payload = this.draft();
    if (!this.noteForm().valid()) {
      this.saveLabel.set('Add a title before saving');
      return;
    }

    this.saveLabel.set('Saving…');
    const request = id === null
      ? this.notesService.createNote(payload)
      : this.notesService.updateNote(id, payload);
    request.subscribe({
      next: (note) => {
        this.saveLabel.set('Saved to database');
        this.isCreating.set(false);
        this.selectedId.set(note.id);
        this.notesService.reload();
      },
      error: () => this.saveLabel.set('Could not save note'),
    });
  }

  protected createNote(): void {
    this.selectedId.set(null);
    this.isCreating.set(true);
    this.draft.set({ title: '', content: '' });
    this.saveLabel.set('Draft — not saved yet');
  }

  protected deleteSelected(): void {
    const id = this.selectedId();
    if (id === null) return;
    this.saveLabel.set('Deleting…');
    this.notesService.deleteNote(id).subscribe({
      next: () => {
        const nextNote = this.notes().find((note) => note.id !== id);
        this.selectedId.set(nextNote?.id ?? null);
        this.notesService.reload();
      },
      error: () => this.saveLabel.set('Could not delete note'),
    });
  }

  private toViewNote(note: ApiNote): Note {
    const content = note.content ?? '';
    const collection = this.collections[note.id % this.collections.length];
    const created = note.created_at ? new Date(note.created_at) : new Date();
    const updated = note.updated_at ? new Date(note.updated_at) : created;
    return {
      ...note,
      content,
      preview: content.split('\n')[0].slice(0, 100) || 'An empty note waiting for an idea.',
      date: this.formatDate(created),
      edited: this.formatRelativeDate(updated),
      collection: collection.name,
      color: collection.color,
      readTime: Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 180)),
      pinned: this.localPinned().has(note.id),
    };
  }

  private formatDate(date: Date): string {
    const day = date.toDateString() === new Date().toDateString()
      ? 'Today'
      : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    return day;
  }

  private formatRelativeDate(date: Date): string {
    const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    return hours < 24 ? `${hours} hr ago` : `${Math.round(hours / 24)} days ago`;
  }
}
