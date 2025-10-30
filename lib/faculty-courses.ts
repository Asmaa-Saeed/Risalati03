// Types and interfaces for faculty courses management
export interface Course {
  id: string;
  courseId: string;
  name: string;
  description: string;
  instructor: string;
  instructorId: string;
  credits: number;
  duration: string; // e.g., "3 hours/week", "2 semesters"
  department: string;
  college: string;
  university: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  courseId: string;
  name: string;
  description: string;
  instructor: string;
  instructorId: string;
  credits: number;
  duration: string;
  department: string;
  college: string;
  university: string;
  status: 'active' | 'inactive' | 'draft';
}

export interface UpdateCourseData extends Omit<Partial<CreateCourseData>, 'courseId'> {
  id: string;
  courseId: string;
}

// Mock data service
export class CoursesService {
  private static courses: Course[] = [
    {
      id: '1',
      courseId: 'CS101',
      name: 'مقدمة في علوم الحاسب',
      description: 'مقرر أساسي في علوم الحاسب يغطي المفاهيم الأساسية',
      instructor: 'د. أحمد محمد',
      instructorId: 'inst_1',
      credits: 3,
      duration: '3 ساعات أسبوعياً',
      department: 'هندسة الحاسبات',
      college: 'كلية الهندسة',
      university: 'جامعة القاهرة',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      courseId: 'CS201',
      name: 'هيكل البيانات والخوارزميات',
      description: 'دراسة هيكل البيانات والخوارزميات الأساسية',
      instructor: 'د. فاطمة علي',
      instructorId: 'inst_2',
      credits: 4,
      duration: '4 ساعات أسبوعياً',
      department: 'هندسة الحاسبات',
      college: 'كلية الهندسة',
      university: 'جامعة الإسكندرية',
      status: 'active',
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: '3',
      courseId: 'AI301',
      name: 'الذكاء الاصطناعي',
      description: 'مقرر متقدم في الذكاء الاصطناعي وتعلم الآلة',
      instructor: 'د. محمد السيد',
      instructorId: 'inst_3',
      credits: 3,
      duration: '3 ساعات أسبوعياً',
      department: 'هندسة الحاسبات',
      college: 'كلية الهندسة',
      university: 'جامعة القاهرة',
      status: 'active',
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-01T09:15:00Z',
    },
    {
      id: '4',
      courseId: 'DB401',
      name: 'قواعد البيانات المتقدمة',
      description: 'دراسة قواعد البيانات المتقدمة وأنظمة إدارة البيانات',
      instructor: 'د. سارة أحمد',
      instructorId: 'inst_4',
      credits: 3,
      duration: '3 ساعات أسبوعياً',
      department: 'هندسة الحاسبات',
      college: 'كلية الهندسة',
      university: 'جامعة الإسكندرية',
      status: 'inactive',
      createdAt: '2024-02-10T16:45:00Z',
      updatedAt: '2024-02-15T11:20:00Z',
    },
    {
      id: '5',
      courseId: 'SE501',
      name: 'هندسة البرمجيات',
      description: 'منهجيات وأدوات هندسة البرمجيات الحديثة',
      instructor: 'د. خالد حسن',
      instructorId: 'inst_5',
      credits: 3,
      duration: '3 ساعات أسبوعياً',
      department: 'هندسة الحاسبات',
      college: 'كلية الهندسة',
      university: 'جامعة القاهرة',
      status: 'draft',
      createdAt: '2024-03-01T13:00:00Z',
      updatedAt: '2024-03-01T13:00:00Z',
    },
  ];

  // Simulate API delay
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getCourses(): Promise<{ success: boolean; data: Course[]; message?: string }> {
    await this.delay();
    try {
      return {
        success: true,
        data: this.courses,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'حدث خطأ في جلب البيانات',
      };
    }
  }

  static async getCourse(id: string): Promise<{ success: boolean; data: Course | null; message?: string }> {
    await this.delay();
    try {
      const course = this.courses.find(c => c.id === id);
      if (!course) {
        return {
          success: false,
          data: null,
          message: 'المحاضر غير موجود',
        };
      }
      return {
        success: true,
        data: course,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'حدث خطأ في جلب البيانات',
      };
    }
  }

  static async createCourse(courseData: CreateCourseData): Promise<{ success: boolean; data: Course | null; message?: string }> {
    await this.delay();
    try {
      const newCourse: Course = {
        ...courseData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.courses.push(newCourse);

      return {
        success: true,
        data: newCourse,
        message: 'تم إضافة المحاضر بنجاح',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'حدث خطأ في إضافة المحاضر',
      };
    }
  }

  static async updateCourse(courseData: UpdateCourseData): Promise<{ success: boolean; data: Course | null; message?: string }> {
    await this.delay();
    try {
      const index = this.courses.findIndex(c => c.id === courseData.id);
      if (index === -1) {
        return {
          success: false,
          data: null,
          message: 'المحاضر غير موجود',
        };
      }

      const updatedCourse: Course = {
        ...this.courses[index],
        ...courseData,
        updatedAt: new Date().toISOString(),
      };

      this.courses[index] = updatedCourse;

      return {
        success: true,
        data: updatedCourse,
        message: 'تم تحديث المحاضر بنجاح',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'حدث خطأ في تحديث المحاضر',
      };
    }
  }

  static async deleteCourse(id: string): Promise<{ success: boolean; message?: string }> {
    await this.delay();
    try {
      const index = this.courses.findIndex(c => c.id === id);
      if (index === -1) {
        return {
          success: false,
          message: 'المحاضر غير موجود',
        };
      }

      this.courses.splice(index, 1);

      return {
        success: true,
        message: 'تم حذف المحاضر بنجاح',
      };
    } catch (error) {
      return {
        success: false,
        message: 'حدث خطأ في حذف المحاضر',
      };
    }
  }
}
