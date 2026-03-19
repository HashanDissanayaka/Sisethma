import { BookOpen, Calculator, FlaskRound, Languages, PenTool, Globe, Send } from 'lucide-react';

export const teachers = [
    {
        id: 1,
        name: "Bhagya Ranasinghe",
        subject: "Mathematics",
        qualifications: "076 639 9931",
        image: "/bhagya.jpeg",
        grades: "Grade 6 - 11",
        color: "bg-blue-600",
        icon: Calculator
    },
    {

        id: 2,
        name: "Abeyruwan Katulanda",
        subject: "Science",
        qualifications: "071 402 4048",
        image: null,
        grades: "Grade 6 - 11",
        color: "bg-green-600",
        icon: FlaskRound
    },
    {

        id: 3,
        name: "Hashan Dissanayake",
        subject: "ICT",
        qualifications: "Software Eng. BIT (UOM)",
        image: "/hashan.jpg", // Placeholder for user uploaded image
        grades: "Grade 6 - 11",
        color: "bg-purple-600",
        icon: Globe
    },
    {
        id: 4,
        name: "Nirmani Abeyasinghe",
        subject: "English",
        qualifications: "076 605 2998",
        image: null,
        grades: "Grade 6 - 11",
        color: "bg-orange-500",
        icon: Languages
    },
    {
        id: 5,
        name: "Thikshana S. Karunathilaka",
        subject: "Sinhala",
        qualifications: "075 293 6856",
        image: null,
        grades: "Grade 6 - 11",
        color: "bg-yellow-500",
        icon: PenTool
    },
    {
        id: 6,
        name: "Mahesh Dayarathne",
        subject: "Karate",
        qualifications: "076 705 0021",
        image: null,
        grades: "All Grades",
        color: "bg-red-600",
        icon: Send
    }
];

export const heroContent = {
    title: "සිසෙත්මා",
    subtitle: "Nelumdeniya",
    description: "A fresh start for a bright future. Join us for the 2026 new class sessions.",
    cta: "Join Now",
    contact: "077 675 3363"
};

export const timeTable = [
    {
        subject: "Mathematics",
        teacher: "Bhagya Ranasinghe",
        schedule: [
            { grade: "Grade 6", time: "Saturday 2.00 - 4.00 PM" },
            { grade: "Grade 7", time: "Saturday 12.00 - 2.00 PM" },
            { grade: "Grade 8", time: "Saturday 10.00 - 12.00 AM" },
            { grade: "Grade 9", time: "Saturday 8.00 - 10.00 AM" },
            { grade: "Grade 10", time: "Sunday 2.30 - 5.30 PM" },
            { grade: "Grade 11", time: "Sunday 2.30 - 5.30 PM" },
        ]
    },
    {
        subject: "Science",
        teacher: "Abeyruwan Katulanda",
        schedule: [
            { grade: "Grade 6", time: "Saturday 4.00 - 6.00 PM" },
            { grade: "Grade 7", time: "Saturday 2.00 - 4.00 PM" },
            { grade: "Grade 8", time: "Saturday 2.00 - 4.00 PM" },
            { grade: "Grade 9", time: "Friday 2.30 - 4.30 PM" },
            { grade: "Grade 10", time: "Friday 2.30 - 4.30 PM" },
            { grade: "Grade 11", time: "Thursday 2.30 - 6.00 PM" },
        ]
    },
    {
        subject: "ICT",
        teacher: "Hashan Dissanayake",
        schedule: [
            { grade: "Grade 6", time: "Saturday 8.00 - 10.00 AM" },
            { grade: "Grade 7", time: "Sunday 1.00 - 3.00 PM" },
            { grade: "Grade 8", time: "Saturday 4.00 - 6.00 PM" },
            { grade: "Grade 9", time: "Sunday 4.00 - 6.00 PM" },
            { grade: "Grade 10", time: "Saturday 10.00 - 12.00 AM" },
            { grade: "Grade 11", time: "Saturday 12.00 - 02.00 PM" },
        ]
    },
    {
        subject: "English",
        teacher: "Nirmani Abeyasinghe",
        schedule: [
            { grade: "Grade 6", time: "Saturday 10.00 - 12.00 AM" },
            { grade: "Grade 7", time: "Saturday 8.00 - 10.00 AM" },
            { grade: "Grade 8", time: "Saturday 8.00 - 10.00 AM" },
            { grade: "Grade 9", time: "Saturday 10.00 - 12.00 AM" },
            { grade: "Grade 10", time: "Tuesday 2.30 - 5.30 PM" },
            { grade: "Grade 11", time: "Tuesday 2.30 - 5.30 PM" },
            { grade: "Grade 1-5", time: "Saturday 12.00 - 2.00 PM" },
        ]
    },
    {
        subject: "Sinhala",
        teacher: "Thikshana S. Karunathilaka",
        schedule: [
            { grade: "Grade 6", time: "Saturday 12.00 - 2.00 PM" },
            { grade: "Grade 7", time: "Saturday 10.00 - 12.00 AM" },
            { grade: "Grade 8", time: "Saturday 12.00 - 2.00 PM" },
            { grade: "Grade 9", time: "Sunday 2.00 - 4.00 PM" },
            { grade: "Grade 10", time: "Saturday 2.00 - 4.00 PM" },
            { grade: "Grade 11", time: "Saturday 2.30 - 5.30 PM" },
            { grade: "Grade 1-5", time: "Saturday 4.30 - 6.30 PM" } // Adjusted from image note if needed
        ]
    },
    {
        subject: "Karate",
        teacher: "Mahesh Dayarathne",
        schedule: [
            { grade: "All Grades", time: "Sunday 5.00 - 8.00 PM" },
        ]
    }
];
