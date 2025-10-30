"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { TracksService, CreateTrackData, UpdateTrackData, Track } from "@/lib/tracks";
import TracksTable from "./TracksTable";
import AddTrackModal from "./AddTrackModal";
import EditTrackModal from "./EditTrackModal";
import DeleteTrackConfirmModal from "./DeleteTrackConfirmModal";

type ModalType = "add" | "edit" | "delete" | null;

export default function TracksManagement() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load tracks on component mount
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const response = await TracksService.getTracks();
      if (response.succeeded && response.data) {
        setTracks(response.data);
      } else {
        setMessage({
          type: "error",
          text: response.message || "حدث خطأ في تحميل البيانات",
        });
      }
    } catch (error) {
      console.error("❌ Error loading tracks:", error);
      setMessage({ type: "error", text: "حدث خطأ في تحميل البيانات" });
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const handleAddTrack = async (trackData: CreateTrackData) => {
    setSaving(true);
    try {
      const response = await TracksService.createTrack(trackData);
      if (response.succeeded && response.data) {
        await loadTracks();
        closeModal();
        setMessage({ type: "success", text: "✅ تم إضافة المسار بنجاح" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "❌ فشل في إضافة المسار",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ حدث خطأ في إضافة المسار" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleEditTrack = async (data: UpdateTrackData) => {
    try {
      setSaving(true);

      const response = await TracksService.updateTrack(data);

      if (response.succeeded) {
        // Reload tracks from API to get updated department names
        await loadTracks();

        closeModal();
        setMessage({ type: "success", text: "✅ تم تحديث المسار بنجاح" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || "❌ فشل في تحديث المسار",
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("❌ Error updating track:", error);
      setMessage({ type: "error", text: "❌ حدث خطأ أثناء تحديث المسار" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrack = async () => {
    if (!selectedTrack) return;

    setSaving(true);
    try {
      const response = await TracksService.deleteTrack(selectedTrack.id);

      if (response.succeeded) {
        await loadTracks();
        setCurrentPage(1);
        setMessage({ type: "success", text: "✅ " + (response.message || "تم حذف المسار بنجاح") });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: "❌ " + (response.message || "حدث خطأ في حذف المسار"),
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ حدث خطأ في حذف المسار" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type: ModalType, track?: Track) => {
    setActiveModal(type);
    setSelectedTrack(track || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTrack(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(tracks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTracks = tracks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المسارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة المسارات</h2>
        <p className="text-gray-600">
          إدارة وتنظيم جميع المسارات التخصصية في النظام الأكاديمي
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 shadow-lg transform transition-all duration-500 ease-in-out animate-in slide-in-from-top-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200 shadow-green-100"
              : "bg-red-50 text-red-800 border border-red-200 shadow-red-100"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Data Table */}
      <TracksTable
        tracks={currentTracks}
        onEdit={(track: Track) => openModal("edit", track)}
        onDelete={(track: Track) => openModal("delete", track)}
        onAdd={() => openModal("add")}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white shadow-sm border border-gray-200 rounded-xl p-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 hover:shadow-md"
            >
              <span>← السابق</span>
            </button>

            {/* Current Page and Next/Previous */}
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-gray-600">صفحة</span>
              <span className="text-lg font-bold text-teal-600">{currentPage}</span>
              <span className="text-sm text-gray-600">من</span>
              <span className="text-lg font-bold text-gray-900">{totalPages}</span>
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 hover:shadow-md"
            >
              <span>التالي →</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddTrackModal
        isOpen={activeModal === "add"}
        onClose={closeModal}
        onSubmit={handleAddTrack}
        loading={saving}
      />

      <EditTrackModal
        isOpen={activeModal === "edit"}
        onClose={closeModal}
        onSubmit={handleEditTrack}
        track={selectedTrack}
        loading={saving}
      />

      <DeleteTrackConfirmModal
        isOpen={activeModal === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteTrack}
        track={selectedTrack}
        loading={saving}
      />
    </div>
  );
}
