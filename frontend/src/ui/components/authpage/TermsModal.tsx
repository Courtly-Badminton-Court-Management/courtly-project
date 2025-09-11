"use client";

import Modal from "./Modal";

export default function TermsModal({
  open,
  onClose,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Terms & Conditions"
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-platinum px-4 py-2 text-onyx hover:bg-platinum/40"
          >
            Close
          </button>
          <button
            onClick={() => {
              onAccept?.();
              onClose();
            }}
            className="rounded-lg bg-cambridge px-4 py-2 font-semibold text-white hover:bg-sea"
          >
            I Agree
          </button>
        </div>
      }
    >
      {/* --- เนื้อหาเงื่อนไข (ใส่ของจริงได้เลย) --- */}
      <p className="mb-3 text-sm text-walnut">
        Welcome to Courtly. Please read these terms carefully before using our service.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>Bookings are confirmed after payment is captured in your wallet.</li>
        <li>Cancellation &amp; refund follow venue policy per slot.</li>
        <li>No-show may affect your booking privileges.</li>
        <li>We process personal data as described in our Privacy Policy.</li>
      </ol>
      <p className="mt-3 text-sm text-walnut">
        By clicking “I Agree”, you acknowledge that you have read and accepted these terms.
      </p>
    </Modal>
  );
}
