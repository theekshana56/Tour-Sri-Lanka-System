"use client";

export function SuccessCheckmark() {
  return (
    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
      <svg
        className="h-24 w-24"
        viewBox="0 0 52 52"
        aria-hidden
      >
        <circle
          className="animate-[draw-circle_0.6s_ease-in-out_forwards]"
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeDasharray="150"
          strokeDashoffset="150"
          style={{
            animation: "draw-circle 0.6s ease-in-out forwards",
          }}
        />
        <path
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27 l7 7 16-16"
          strokeDasharray="48"
          strokeDashoffset="48"
          style={{
            animation: "draw-check 0.4s 0.5s ease-in-out forwards",
          }}
        />
      </svg>
      <style jsx>{`
        @keyframes draw-circle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes draw-check {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
