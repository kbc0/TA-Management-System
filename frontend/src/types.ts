export interface SwapRequest {
    id: number;
    title: string;
    reason?: string;
    status?: "Pending" | "Accepted" | "Declined"; // Durum bilgisi eklendi
    date?: string;      // Eğer doğrudan kullanılacaksa
    time?: string;      // Aynı şekilde
    location?: string;
  
    yourTask: {
      course: string;
      task: string;
      date: string;
      time: string;
      location: string;
      status: string;
      requester: string;
      with: string;
    };
  
    proposedTask: {
      ta: string;
      course: string;
      task: string;
      date: string;
      time: string;
    };
  
    timeline: {
      sent: string;
      taResponse: string;
      instructorApproval: string;
    };
  }
  export interface SimpleRequest {
    id: number;
    title: string;
    date: string;
    time: string;
    location?: string;
    with?: string;
    requester?: string;
    status?: "Pending" | "Accepted" | "Declined";
  }