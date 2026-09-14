"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("War");
  const [isLoading, setIsLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null as number | null,
    eventName: "",
  });

  const lastArmoryTimestamp = useRef<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    fetchActiveEvent();
    fetchHistory();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeEvent) {
      interval = setInterval(() => {
        syncXanax();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [activeEvent]);

  const fetchActiveEvent = async () => {
    const res = await fetch("/api/event/active");
    const data = await res.json();
    if (data.success && data.event) {
      setActiveEvent(data.event);
    }
  };

  const fetchHistory = async () => {
    const res = await fetch("/api/event/history");
    const data = await res.json();
    if (data.success) {
      setHistory(data.history);
    }
  };

  const syncXanax = async () => {
    if (!activeEvent) return;
    try {
      const res = await fetch("/api/event/sync-xanax");
      const data = await res.json();
      if (data.success) {
        fetchHistory(); // لتحديث الجدول قدامك بالشاشة
      }
    } catch (error) {
      console.error("Xanax Sync Error:", error);
    }
  };

  const handleStartEvent = async () => {
    if (!eventName) return alert("Please enter an event name!");
    setIsLoading(true);
    try {
      const res = await fetch("/api/event/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: eventName, type: eventType }),
      });

      // هنا الحل السحري اللي بيمنع الانهيار:
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server Error:", errorText);
        alert(
          "السيرفر رفض الطلب: " +
            (errorText.includes("Internal")
              ? "مشكلة في اتصال الداتابيز"
              : errorText),
        );
        return;
      }

      const data = await res.json();
      if (data.success) {
        setEventName("");
        lastArmoryTimestamp.current = Math.floor(Date.now() / 1000);
        fetchActiveEvent();
        fetchHistory();
      } else {
        alert("Failed to start event: " + data.error);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
      alert("تعذر الاتصال بالسيرفر نهائياً.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndEvent = async () => {
    if (!activeEvent) return;
    setIsLoading(true);
    try {
      await syncXanax();
      const res = await fetch("/api/event/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: activeEvent.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveEvent(null);
        fetchHistory();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!deleteModal.eventId) return;

    try {
      const res = await fetch("/api/event/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: deleteModal.eventId }),
      });
      const data = await res.json();

      if (data.success) {
        fetchHistory();
        if (activeEvent?.id === deleteModal.eventId) {
          setActiveEvent(null);
        }
        setDeleteModal({ isOpen: false, eventId: null, eventName: "" });
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const formatItems = (itemsStr: string) => {
    if (!itemsStr) return null;
    try {
      const items = JSON.parse(itemsStr);
      if (items.length === 0) return null;
      return items.map((i: any) => `${i.quantity}x ${i.name}`).join(" | ");
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-12 relative">
      {!activeEvent ? (
        <section className="bg-[#1C1C1C]/80 backdrop-blur-sm border border-[#D4AF37]/40 rounded-xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#D4AF37] rounded-full inline-block"></span>
            Create New Event
          </h2>
          {/* Modified: md:items-end instead of items-end for mobile wrapping */}
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-400 mb-2">
                Event Name
              </label>
              <input
                type="text"
                placeholder="e.g., VTH War"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm text-gray-400 mb-2">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] appearance-none"
              >
                <option value="War">Ranked War</option>
                <option value="Chain">Faction Chain</option>
              </select>
            </div>
            <button
              onClick={handleStartEvent}
              disabled={isLoading}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Starting..." : "Start Event"}
            </button>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-br from-[#1C1C1C] to-[#0D0D0D] border border-emerald-500/30 rounded-xl p-4 md:p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="animate-pulse w-3 h-3 bg-emerald-500 rounded-full"></span>
                <span className="text-emerald-500 font-semibold tracking-wider text-sm uppercase">
                  Active {activeEvent.type}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {activeEvent.name}
              </h2>
              <p className="text-gray-400 text-xs md:text-sm">
                Tracking Xanax usage and attacks in background...
              </p>
            </div>
            <button
              onClick={handleEndEvent}
              disabled={isLoading}
              className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white font-bold py-3 px-10 rounded-lg shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Ending & Fetching..." : "End Event"}
            </button>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3">
          Events History
        </h2>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events found.</p>
          ) : (
            history.map((ev) => (
              <div
                key={ev.id}
                className="bg-[#1C1C1C] border border-gray-800 rounded-xl overflow-hidden transition-all"
              >
                <div
                  className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-[#252525] transition-colors group"
                  onClick={() =>
                    setOpenAccordion(openAccordion === ev.id ? null : ev.id)
                  }
                >
                  <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                    <div
                      className={`px-3 py-1 rounded text-xs font-bold uppercase shrink-0 ${ev.type === "War" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}
                    >
                      {ev.type}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="text-base md:text-lg font-bold text-white flex flex-wrap items-center gap-2">
                        {ev.name}
                        {ev.status === "Active" && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30"
                            style={{ padding: "0.05rem 0.5rem" }}
                          >
                            LIVE
                          </span>
                        )}
                      </h3>
                      {ev.status === "Ended" && (
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                          <span className="text-xs font-semibold text-emerald-400">
                            +{ev.respectGained?.toLocaleString()} Respect
                          </span>
                          {ev.type === "War" && formatItems(ev.itemsGained) && (
                            <span className="text-xs text-gray-400 border-l border-gray-600 pl-2 md:pl-3 break-words">
                              {formatItems(ev.itemsGained)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
                    <span className="text-sm font-semibold text-[#D4AF37]">
                      {ev.status === "Active"
                        ? "View Live Stats"
                        : "View Report"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal({
                            isOpen: true,
                            eventId: ev.id,
                            eventName: ev.name,
                          });
                        }}
                        className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors shadow-lg shadow-red-900/20 md:opacity-0 group-hover:opacity-100 shrink-0"
                        title="Delete Event"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform shrink-0 ${openAccordion === ev.id ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {openAccordion === ev.id && (
                  <div className="bg-[#0D0D0D] border-t border-gray-800 p-2 md:p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="text-gray-400 text-xs md:text-sm border-b border-gray-800">
                            <th className="pb-3 px-2 md:px-4">Member Name</th>
                            <th className="pb-3 px-2 md:px-4 text-center">
                              Xanax Used
                            </th>
                            <th className="pb-3 px-2 md:px-4 text-center">
                              Expected Attacks
                            </th>
                            <th className="pb-3 px-2 md:px-4 text-center">
                              Total Attacks
                            </th>
                            <th className="pb-3 px-2 md:px-4 text-center">
                              Respect / Score
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ev.members.map((m: any, index: number) => {
                            const expectedAttacks = m.xanax * 10;
                            const attacksColor =
                              m.attacks >= expectedAttacks &&
                              expectedAttacks > 0
                                ? "text-emerald-400"
                                : m.xanax > 0 && m.attacks < expectedAttacks
                                  ? "text-red-400"
                                  : "text-gray-300";

                            return (
                              <tr
                                key={m.id}
                                className={`border-b border-gray-800/50 hover:bg-[#1A1A1A] transition-colors text-xs md:text-sm ${index % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#121212]"}`}
                              >
                                <td className="py-3 px-2 md:px-4 font-semibold text-[#E0E0E0] whitespace-nowrap">
                                  {m.name}
                                </td>
                                <td className="py-3 px-2 md:px-4 text-center text-[#D4AF37] font-bold">
                                  {m.xanax}
                                </td>
                                <td className="py-3 px-2 md:px-4 text-center text-gray-400 font-medium">
                                  {expectedAttacks}
                                </td>
                                <td
                                  className={`py-3 px-2 md:px-4 text-center font-bold ${attacksColor}`}
                                >
                                  {m.attacks}
                                </td>
                                <td className="py-3 px-2 md:px-4 text-center text-blue-400 font-bold">
                                  {m.respect?.toFixed(2) || 0}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#1C1C1C] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-900/20 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-500/20 p-3 rounded-full text-red-500 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Delete Event</h3>
            </div>
            <p className="text-gray-300 mb-8 text-sm leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-[#D4AF37] font-bold">
                "{deleteModal.eventName}"
              </span>
              ?<br />
              <span className="text-red-400 mt-2 block">
                This action cannot be undone and all member statistics for this
                event will be lost.
              </span>
            </p>
            <div className="flex flex-col-reverse md:flex-row justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    eventId: null,
                    eventName: "",
                  })
                }
                className="px-5 py-3 md:py-2.5 rounded-lg font-semibold text-gray-300 bg-[#2A2A2A] hover:bg-[#333333] transition-colors w-full md:w-auto text-center"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEvent}
                className="px-5 py-3 md:py-2.5 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/50 transition-colors w-full md:w-auto text-center"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
