import { NextResponse } from "next/server";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface Attachment {
  fileName: number;
  contentType: string;
  displayName: string;
}

const fileUrl = (fileId: number) => `${APIURL}/Files/GetFile/${fileId}`;

export async function getStudentByNationalId(nationalId: string) {
  if (!nationalId) throw new Error("يرجى إدخال الرقم القومي");

  const backendRes = await fetch(`${APIURL}/RegisterationCard/getByNationalNumber/${nationalId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!backendRes.ok) throw new Error("فشل في جلب بيانات الطالب");

  const backendJson = await backendRes.json();
  if (!backendJson.succeeded) throw new Error(backendJson.message || "لا توجد بيانات للطالب");

  const data = backendJson.data;
  const attachments: Attachment[] = data.attachments || [];

  const getAttachmentUrl = (name: string) => {
    const att = attachments.find(a => a.displayName.includes(name));
    return att ? fileUrl(att.fileName) : null;
  };

  return {
    ...data,
    degreeImage: getAttachmentUrl("البكالوريوس"),
    masterImage: getAttachmentUrl("الماجستير"),
    transferImage: getAttachmentUrl("المعادلة"),
    status: data.status,
  };
}
