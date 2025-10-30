"use client";

import { useState } from "react";
import MainForm, { FormType } from "./MainForm";

export default function Page() {
  const [activate, setActivate] = useState<FormType>(null);

  return <MainForm setActivate={setActivate} />;
}
