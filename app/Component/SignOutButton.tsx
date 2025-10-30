"use client";

import { useRouter } from "next/navigation";

const customStyles = `
  .door-button-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 50;
  }

  .door-button {
    background-color: #4b7770;
    color: white;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: start;
    cursor: pointer;
    overflow: hidden;
    transition: width 0.4s ease, background-color 0.3s ease;
    width: 56px; /* في البداية صغير */
    height: 56px;
    padding: 0 1rem;
    white-space: nowrap;
    position: relative;
  }

  .door-icon {
    font-size: 1.5rem;
    transition: transform 0.6s ease;
    flex-shrink: 0;
  }

  .door-text {
    opacity: 0;
    transform: translateX(-10px);
    margin-left: 0.5rem;
    font-weight: 600;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .door-button:hover {
    width: 180px; /* يتوسّع عند الهوفر */
    background-color: #4b7770;
  }

  .door-button:hover .door-icon {
    transform: rotate(360deg);
  }

  .door-button:hover .door-text {
    opacity: 1;
    transform: translateX(0);
  }
`;

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/");
  };

  return (
    <>
      <style jsx global>
        {customStyles}
      </style>

      <div className="door-button-container">
        <button
          onClick={handleSignOut}
          className="door-button focus:outline-none focus:ring-4 focus:ring-red-300"
          aria-label="تسجيل خروج"
        >
          <span className="door-icon" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 3H12C13.1 3 14 3.9 14 5V19C14 20.1 13.1 21 12 21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3Z"
                stroke="#000"
                strokeWidth="3"
              />
              <path d="M20 12L16 8V11H9V13H16V16L20 12Z" fill="#000" />
            </svg>
          </span>
          <span className="door-text">تسجيل خروج</span>
        </button>
      </div>
    </>
  );
}
