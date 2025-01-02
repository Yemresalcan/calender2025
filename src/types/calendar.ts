export interface Week {
    id?: string;
    code: string;
    title: string;
    description: string;
    color: string;
    days: number[];
    monthId?: string;
}

export interface Month {
    id?: string;
    name: string;
    weeks: Week[];
    userId?: string;
} 