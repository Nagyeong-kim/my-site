/*
  calendar.js — Lab calendar management
  - Stores events in IndexedDB
  - Renders monthly calendar view
  - Allows add/edit/delete events
*/

(function(){
  const DB_NAME = 'calendar-db';
  const DB_VERSION = 1;
  let db = null;
  let currentDate = new Date();
  let selectedDate = null;

  function openDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const idb = e.target.result;
        if(!idb.objectStoreNames.contains('events')) {
          idb.createObjectStore('events', {keyPath: 'id', autoIncrement: true});
        }
      };
      req.onsuccess = () => { db = req.result; resolve(db); };
      req.onerror = () => reject(req.error);
    });
  }

  function idbPut(value){
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const r = value.id ? store.put(value) : store.add(value);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }

  function idbGetAll(){
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('events', 'readonly');
      const store = tx.objectStore('events');
      const r = store.getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    });
  }

  function idbDelete(id){
    return new Promise((resolve,reject)=>{
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      const r = store.delete(id);
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
  }

  // UI elements
  const monthYearEl = document.getElementById('month-year');
  const calendarDaysEl = document.getElementById('calendar-days');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  const eventForm = document.getElementById('event-form');
  const eventTitleEl = document.getElementById('event-title');
  const eventDateEl = document.getElementById('event-date');
  const eventTimeEl = document.getElementById('event-time');
  const eventDescEl = document.getElementById('event-desc');
  const eventColorEl = document.getElementById('event-color');
  const eventRepeatEl = document.getElementById('event-repeat');
  const eventRepeatEndEl = document.getElementById('event-repeat-end');
  const selectedDateDisplayEl = document.getElementById('selected-date-display');
  const eventsListEl = document.getElementById('events-list');
  const formTitleEl = document.getElementById('form-title');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const formCancelBtn = document.getElementById('form-cancel-btn');
  
  let editingEventId = null;

  function getDaysInMonth(year, month){
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month){
    return new Date(year, month, 1).getDay();
  }

  function renderCalendar(){
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearEl.textContent = currentDate.toLocaleString('en-US', {month: 'long', year: 'numeric'});
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    calendarDaysEl.innerHTML = '';
    
    // Empty cells for days before month starts
    for(let i = 0; i < firstDay; i++){
      const cell = document.createElement('div');
      cell.className = 'calendar-day empty';
      calendarDaysEl.appendChild(cell);
    }
    
    // Days of month
    for(let day = 1; day <= daysInMonth; day++){
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      cell.dataset.date = dateStr;
      
      const dayNum = document.createElement('div');
      dayNum.className = 'day-number';
      dayNum.textContent = day;
      
      cell.appendChild(dayNum);
      cell.addEventListener('click', () => selectDate(dateStr, cell));
      
      // Highlight today
      const today = new Date();
      if(today.getFullYear() === year && today.getMonth() === month && today.getDate() === day){
        cell.classList.add('today');
      }
      
      calendarDaysEl.appendChild(cell);
    }
    
    renderCalendarWithEvents();
  }

  async function selectDate(dateStr, cellEl){
    selectedDate = dateStr;
    
    // Update selected date display
    const dateObj = new Date(dateStr + 'T00:00:00');
    selectedDateDisplayEl.textContent = dateObj.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    
    // Set date field in form
    eventDateEl.value = dateStr;
    
    // Render events for this date
    await renderEventsForDate(dateStr);
    
    // Update calendar highlighting
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    if(cellEl) cellEl.classList.add('selected');
  }

  async function renderEventsForDate(dateStr){
    const allEvents = await idbGetAll();
    const dayEvents = allEvents.filter(e => e.date === dateStr).sort((a,b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
    
    eventsListEl.innerHTML = '';
    
    if(dayEvents.length === 0){
      eventsListEl.innerHTML = '<p class="muted">No events</p>';
      return;
    }
    
    dayEvents.forEach(event => {
      const el = document.createElement('div');
      el.className = 'event-item';
      el.style.borderLeftColor = getColorValue(event.color || 'blue');
      
      const titleRow = document.createElement('div');
      titleRow.className = 'event-title-row';
      
      const title = document.createElement('h4');
      title.textContent = event.title;
      
      const importanceBtn = document.createElement('button');
      importanceBtn.className = 'btn-importance';
      importanceBtn.innerHTML = event.important ? '★' : '☆';
      importanceBtn.title = event.important ? 'Remove importance' : 'Mark as important';
      importanceBtn.addEventListener('click', async () => {
        event.important = !event.important;
        await idbPut(event);
        await renderEventsForDate(dateStr);
        renderCalendarWithEvents();
      });
      
      titleRow.appendChild(title);
      titleRow.appendChild(importanceBtn);
      
      const meta = document.createElement('div');
      meta.className = 'event-meta';
      meta.textContent = event.time ? event.time : '(all day)';
      
      const desc = document.createElement('p');
      desc.className = 'event-desc';
      desc.textContent = event.desc || '';
      
      const actions = document.createElement('div');
      actions.className = 'event-actions';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-small';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => editEvent(event));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-small';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        if(confirm('Delete this event?')){
          await idbDelete(event.id);
          await renderEventsForDate(dateStr);
          renderCalendarWithEvents();
        }
      });
      
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      
      el.appendChild(titleRow);
      el.appendChild(meta);
      if(event.desc) el.appendChild(desc);
      el.appendChild(actions);
      
      eventsListEl.appendChild(el);
    });
  }

  async function renderCalendarWithEvents(){
    const allEvents = await idbGetAll();
    const eventsByDate = {};
    allEvents.forEach(e => {
      if(!eventsByDate[e.date]) eventsByDate[e.date] = [];
      eventsByDate[e.date].push(e);
    });
    
    document.querySelectorAll('.calendar-day:not(.empty)').forEach(cell => {
      const dateStr = cell.dataset.date;
      if(!dateStr) return;
      
      let eventPreview = cell.querySelector('.event-preview');
      if(eventPreview) eventPreview.remove();
      
      if(eventsByDate[dateStr] && eventsByDate[dateStr].length > 0){
        const events = eventsByDate[dateStr];
        const preview = document.createElement('div');
        preview.className = 'event-preview';
        
        events.slice(0, 2).forEach(event => {
          const eventTag = document.createElement('div');
          eventTag.className = 'event-tag';
          eventTag.style.backgroundColor = getColorValue(event.color || 'blue');
          eventTag.style.borderLeftColor = getColorValue(event.color || 'blue');
          
          const eventText = document.createElement('span');
          eventText.textContent = (event.important ? '★ ' : '') + event.title;
          
          eventTag.appendChild(eventText);
          preview.appendChild(eventTag);
        });
        
        if(events.length > 2){
          const more = document.createElement('div');
          more.className = 'event-more';
          more.textContent = `+${events.length - 2} more`;
          preview.appendChild(more);
        }
        
        cell.appendChild(preview);
      }
    });
  }

  function getColorValue(colorName){
    const colors = {
      'blue': '#0b5fa5',
      'green': '#10b981',
      'red': '#ef4444',
      'yellow': '#f59e0b',
      'purple': '#8b5cf6'
    };
    return colors[colorName] || colors['blue'];
  }

  function editEvent(event){
    editingEventId = event.id;
    eventTitleEl.value = event.title;
    eventDateEl.value = event.date;
    eventTimeEl.value = event.time || '';
    eventDescEl.value = event.desc || '';
    eventColorEl.value = event.color || 'blue';
    eventRepeatEl.value = event.repeat || 'none';
    eventRepeatEndEl.value = event.repeatEnd || '';
    
    formTitleEl.textContent = 'Edit Event';
    formSubmitBtn.textContent = 'Update Event';
    formCancelBtn.style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.event-form-card').scrollIntoView({behavior: 'smooth'});
  }

  function cancelEdit(){
    editingEventId = null;
    eventForm.reset();
    formTitleEl.textContent = 'Add Event';
    formSubmitBtn.textContent = 'Add Event';
    formCancelBtn.style.display = 'none';
  }

  // Event handlers
  prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = eventTitleEl.value.trim();
    const date = eventDateEl.value;
    const time = eventTimeEl.value || '';
    const desc = eventDescEl.value.trim();
    const color = eventColorEl.value;
    const repeat = eventRepeatEl.value;
    const repeatEnd = eventRepeatEndEl.value;
    
    if(!title || !date) return alert('Title and date are required');
    
    if(editingEventId){
      // Update existing event - delete old repeating events and create new ones
      const allEvents = await idbGetAll();
      
      // Find and delete all events with the same base properties (repeating events)
      const baseEventToDelete = allEvents.find(e => e.id === editingEventId);
      if(baseEventToDelete && baseEventToDelete.repeat !== 'none'){
        // Delete all events that match the repeat pattern
        for(const evt of allEvents){
          if(evt.title === baseEventToDelete.title && 
             evt.color === baseEventToDelete.color &&
             evt.repeat === baseEventToDelete.repeat){
            await idbDelete(evt.id);
          }
        }
      } else {
        // Just delete the single event
        await idbDelete(editingEventId);
      }
      
      // Create updated base event
      const baseEvent = {
        title, date, time, desc, color,
        repeat, repeatEnd: repeatEnd || null,
        important: false,
        added: Date.now()
      };
      
      await idbPut(baseEvent);
      
      // Generate repeating events if needed
      if(repeat !== 'none' && repeatEnd){
        const startDate = new Date(date);
        const endDate = new Date(repeatEnd);
        let currentDate = new Date(startDate);
        
        while(currentDate <= endDate){
          currentDate = addDays(currentDate, getRepeatInterval(repeat));
          if(currentDate <= endDate){
            const dateStr = currentDate.toISOString().split('T')[0];
            await idbPut({
              ...baseEvent,
              date: dateStr
            });
          }
        }
      }
      
      cancelEdit();
    } else {
      // Add new event
      const baseEvent = {
        title, date, time, desc, color,
        repeat, repeatEnd: repeatEnd || null,
        important: false,
        added: Date.now()
      };
      
      await idbPut(baseEvent);
      
      // Generate repeating events if needed
      if(repeat !== 'none' && repeatEnd){
        const startDate = new Date(date);
        const endDate = new Date(repeatEnd);
        let currentDate = new Date(startDate);
        
        while(currentDate <= endDate){
          currentDate = addDays(currentDate, getRepeatInterval(repeat));
          if(currentDate <= endDate){
            const dateStr = currentDate.toISOString().split('T')[0];
            await idbPut({
              ...baseEvent,
              date: dateStr
            });
          }
        }
      }
    }
    
    eventForm.reset();
    alert(editingEventId ? 'Event updated!' : 'Event added!');
    
    // Re-render events for selected date
    if(selectedDate) await renderEventsForDate(selectedDate);
    renderCalendar();
  });

  formCancelBtn.addEventListener('click', cancelEdit);

  function addDays(date, days){
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getRepeatInterval(repeat){
    const intervals = {
      'daily': 1,
      'weekly': 7,
      'biweekly': 14,
      'monthly': 30
    };
    return intervals[repeat] || 0;
  }

  // Initialize
  (async function init(){
    await openDB();
    renderCalendar();
    
    // Select today
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const todayCell = document.querySelector('.calendar-day.today');
    await selectDate(todayStr, todayCell);
  })();

})();
