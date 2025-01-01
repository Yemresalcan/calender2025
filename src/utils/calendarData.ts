export interface Task {
  title: string;
  description: string;
  type: 'learning' | 'project' | 'practice';
}

export interface WeekData {
  code: string;
  title: string;
  description: string;
  color: string;
  days: number[]; // Haftanın günleri
}

export interface MonthData {
  name: string;
  weeks: WeekData[];
}

export const months: MonthData[] = [
  {
    name: "Ocak",
    weeks: [
      {
        code: "25-01",
        title: "JavaScript ve TypeScript'e Giriş",
        description: "JavaScript, dünya çapında en çok kullanılan programlama dili olarak öne çıkmaktadır. TypeScript'in temellerini öğren.",
        color: "#60a5fa",
        days: [1, 2, 3, 4, 5, 6, 7] // İlk hafta günleri
      },
      {
        code: "25-02",
        title: "TypeScript ile Derinlemesine Çalışma",
        description: "TypeScript'in avantajlarını ve uygulama alanlarını anlamak.",
        color: "#34d399",
        days: [8, 9, 10, 11, 12, 13, 14] // İkinci hafta günleri
      },
      {
        code: "25-03",
        title: "Rust Programlama Diline Giriş",
        description: "Bellek güvenliği ve performansı öne çıkan Rust'ı anlamak.",
        color: "#f472b6",
        days: [15, 16, 17, 18, 19, 20, 21] // Üçüncü hafta günleri
      },
      {
        code: "25-04",
        title: "Go Programlama Diline Giriş",
        description: "Performans ve eşzamanlılık için tasarlanan Go dilini tanımak.",
        color: "#a78bfa",
        days: [22, 23, 24, 25, 26, 27, 28] // Dördüncü hafta günleri
      }
    ]
  },
  // Diğer aylar benzer şekilde...
];