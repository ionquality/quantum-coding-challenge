import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { EventInput } from '@fullcalendar/core';
import Loading from '../Components/Loading';

type CalendarType = 'maintenance' | 'calibration';

interface CalendarProps {
  type: CalendarType;
}

interface ApiEvent {
  id?: number | string;
  title: string;
  date: string;
}

const endpointMap: Record<CalendarType, string> = {
  maintenance: '/api/maintenance-calendar-events',
  calibration:  '/api/calibration-calendar-events',
};

const Calendar: React.FC<CalendarProps> = ({ type }) => {
  const dispatch = useDispatch();

  // Set page title to include type
  useEffect(() => {
    const title = type === 'maintenance'
      ? 'Maintenance Calendar'
      : 'Calibration Calendar';
    dispatch(setPageTitle(title));
  }, [dispatch, type]);

  const [events, setEvents]     = useState<EventInput[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      const endpoint = endpointMap[type];
      try {
        const res = await fetch(`${endpoint}/`);
        if (!res.ok) throw new Error(res.statusText);
        const data: ApiEvent[] = await res.json();

        const formatted = data.map((evt, idx) => ({
          id:    evt.id?.toString() ?? idx.toString(),
          title: evt.title,
          start: evt.date,
        }));

        setEvents(formatted);
      } catch (err) {
        console.error(`Error fetching ${type} events:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [type]);

  if (isLoading) return <Loading />;

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left:   'prev,next today',
          center: 'title',
          right:  'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
      />
    </div>
  );
};

export default Calendar;
