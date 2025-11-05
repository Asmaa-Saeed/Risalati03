import { Suspense } from "react";
import MainLayoutContent from "./MainLayoutContent";

export default function RequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-xl">
          جاري تحميل لوحة التحكم...
        </div>
      }
    >
      <MainLayoutContent />
    </Suspense>
  );
}
