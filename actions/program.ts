const APIURL = process.env.NEXT_PUBLIC_API_URL;

export type Program = {
  id: number;
  value: string;
  type: string; // ممكن تكون "academic" أو "professional"
};

export type Option = {
  id: number;
  value: string;
};

// ✅ fetch all programs
export const fetchPrograms = async (): Promise<Program[]> => {
  try {
    const response = await fetch(`${APIURL}/Lookups/Programs`);
    if (!response.ok) throw new Error("Error fetching programs");
    return await response.json();
  } catch (err) {
    console.error("Error fetching programs", err);
    return [];
  }
};

// ✅ fetch departments by programId
export const fetchDepartments = async (programId: string): Promise<Option[]> => {
  try {
    const response = await fetch(`${APIURL}/Departments?id=${programId}`);
    if (!response.ok) throw new Error("Error fetching departments");
    return await response.json();
  } catch (err) {
    console.error("Error fetching departments", err);
    return [];
  }
};
