import { useEffect, useState } from 'react';
import type { SchoolEvent } from '@/types';
import { actions, useStore } from '@/store';
import { Modal } from '@/components/Modal';
import { useToasts } from '@/components/Toast';
import {
  DURATION_PRESETS,
  type DurationId,
  addDays,
  daysBetween,
  formatDay,
  todayISO,
} from '@/lib/eventListing';
import { CalendarPlus, Eye, Save, Trash2, Ban } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Event to edit; omit to create a new one. */
  event?: SchoolEvent | null;
}

/** "1 week" means 7 listed days including the first, so it ends on day 7. */
function endFor(from: string, days: number) {
  return addDays(from, days - 1);
}

function durationOf(e: SchoolEvent): DurationId {
  if (!e.listUntil) return 'none';
  const from = e.listFrom || todayISO();
  const match = DURATION_PRESETS.find((p) => p.days && endFor(from, p.days) === e.listUntil);
  return match ? match.id : 'custom';
}

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 outline-none transition text-sm';

export function EventFormModal({ open, onClose, event }: Props) {
  const { push } = useToasts();
  const submissionCount = useStore((s) => (event ? s.submissions.filter((x) => x.eventId === event.id).length : 0));
  const isEdit = !!event;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [listFrom, setListFrom] = useState('');
  const [duration, setDuration] = useState<DurationId>('14');
  const [customUntil, setCustomUntil] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset the form each time it opens.
  useEffect(() => {
    if (!open) return;
    const today = todayISO();
    setTouched(false);
    if (event) {
      setName(event.name);
      setDescription(event.description);
      setDate(event.date);
      setListFrom(event.listFrom || today);
      const d = durationOf(event);
      setDuration(d);
      setCustomUntil(event.listUntil || addDays(event.listFrom || today, 13));
    } else {
      setName('');
      setDescription('');
      setDate(today);
      setListFrom(today);
      setDuration('14');
      setCustomUntil(addDays(today, 13));
    }
  }, [open, event]);

  const preset = DURATION_PRESETS.find((p) => p.id === duration)!;
  const listUntil: string | undefined =
    duration === 'none' ? undefined : duration === 'custom' ? customUntil : endFor(listFrom, preset.days!);

  const errors = {
    name: !name.trim() ? 'Give the event a name.' : '',
    date: !date ? 'Pick the event date.' : '',
    listFrom: !listFrom ? 'Pick when parents can start sending feedback.' : '',
    listUntil:
      duration === 'custom' && (!customUntil || (listFrom && customUntil < listFrom))
        ? 'The end date must be on or after the start date.'
        : '',
  };
  const valid = !Object.values(errors).some(Boolean);

  const save = () => {
    setTouched(true);
    if (!valid) return;
    const data = {
      name: name.trim(),
      description: description.trim(),
      date,
      listFrom,
      listUntil,
    };
    if (event) {
      actions.updateEvent(event.id, data);
      push('success', `Saved changes to "${data.name}".`);
    } else {
      actions.addEvent(data);
      push('success', `Added "${data.name}".`);
    }
    onClose();
  };

  const closeNow = () => {
    if (!event) return;
    const yesterday = addDays(todayISO(), -1);
    actions.updateEvent(event.id, {
      listUntil: yesterday,
      listFrom: event.listFrom && event.listFrom > yesterday ? yesterday : event.listFrom,
    });
    push('info', `"${event.name}" is no longer shown to parents.`);
    onClose();
  };

  const remove = () => {
    if (!event) return;
    actions.deleteEvent(event.id);
    push('info', `Deleted "${event.name}".`);
    onClose();
  };

  const today = todayISO();
  const totalDays = listUntil && listFrom ? daysBetween(listFrom, listUntil) + 1 : null;
  const currentlyOpen = !!event && (!event.listFrom || event.listFrom <= today) && (!event.listUntil || event.listUntil >= today);

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit event' : 'Add a new event'} maxWidth="max-w-lg">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div>
          <label htmlFor="evt-name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Event name
          </label>
          <input
            id="evt-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Annual Day Celebration 2026"
            className={inputCls}
            autoFocus
          />
          {touched && errors.name && <p className="text-xs text-giisRed-700 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="evt-desc" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="text-slate-400 font-normal">(shown to parents)</span>
          </label>
          <textarea
            id="evt-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What happened at this event?"
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="evt-date" className="block text-sm font-medium text-slate-700 mb-1.5">
            Event date
          </label>
          <input id="evt-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          {touched && errors.date && <p className="text-xs text-giisRed-700 mt-1">{errors.date}</p>}
        </div>

        <fieldset className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 space-y-4">
          <legend className="px-1 text-sm font-semibold text-brand-800">Listing in the parent feedback portal</legend>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="evt-from" className="block text-xs font-medium text-slate-600 mb-1">
                Show to parents from
              </label>
              <input
                id="evt-from"
                type="date"
                value={listFrom}
                onChange={(e) => setListFrom(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="evt-duration" className="block text-xs font-medium text-slate-600 mb-1">
                For how long
              </label>
              <select
                id="evt-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value as DurationId)}
                className={inputCls}
              >
                {DURATION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {touched && errors.listFrom && <p className="text-xs text-giisRed-700">{errors.listFrom}</p>}

          {duration === 'custom' && (
            <div className="animate-fade-in">
              <label htmlFor="evt-until" className="block text-xs font-medium text-slate-600 mb-1">
                Last day parents can send feedback
              </label>
              <input
                id="evt-until"
                type="date"
                value={customUntil}
                min={listFrom || undefined}
                onChange={(e) => setCustomUntil(e.target.value)}
                className={inputCls}
              />
            </div>
          )}
          {touched && errors.listUntil && <p className="text-xs text-giisRed-700">{errors.listUntil}</p>}

          {listFrom && (!listUntil || listUntil >= listFrom) && (
            <p className="flex items-start gap-2 text-xs text-brand-800 bg-white rounded-lg px-3 py-2 border border-brand-100">
              <Eye size={14} className="mt-0.5 flex-shrink-0" />
              <span>
                Parents can pick this event from <b>{formatDay(listFrom, true)}</b>
                {listUntil ? (
                  <>
                    {' '}
                    to <b>{formatDay(listUntil, true)}</b> ({totalDays} day{totalDays === 1 ? '' : 's'}). After that it
                    disappears from their form.
                  </>
                ) : (
                  ' with no end date, until you close it.'
                )}
              </span>
            </p>
          )}
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div>
            {isEdit && submissionCount === 0 && (
              <button
                type="button"
                onClick={remove}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-giisRed-700 hover:bg-giisRed-50 px-3 py-2 rounded-lg transition"
              >
                <Trash2 size={15} /> Delete
              </button>
            )}
            {isEdit && submissionCount > 0 && currentlyOpen && (
              <button
                type="button"
                onClick={closeNow}
                title="Stop showing this event to parents. Its submissions stay."
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-lg transition"
              >
                <Ban size={15} /> Close now
              </button>
            )}
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-soft"
            >
              {isEdit ? <Save size={16} /> : <CalendarPlus size={16} />} {isEdit ? 'Save changes' : 'Add event'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
