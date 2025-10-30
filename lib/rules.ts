import z from "zod";

export const LoginSchema = z.object( {
nationalId: z.number()
.min(14, "الرقم القومي يجب ان يكون 14 رقم")
.min(1, " يجب ادخال الرقم القومي"),
password: z.string()
.min(8, "كلمة المرور يجب ان تكون اطول من 8 احرف")
.min(1, " يجب ادخال كلمة المرور")
})