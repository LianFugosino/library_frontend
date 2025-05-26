"use client";
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppProvider';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from "sweetalert2";

interface BookType {
  id?: number;
  title: string;
  author: string;
  publisher: string;
  availability: string;
}

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  availableBooks: number;
  borrowedBooks: number;
  lastUpdated?: string;
  meta?: {
    execution_time?: number;
    queries?: Array<{
      query: string;
      bindings: string[];
      time: number;
    }>;
    tables_status?: {
      [key: string]: {
        exists: boolean;
        count: number;
        columns: string[];
      }
    }
  }
}

export default function Dashboard() {
  const { isLoading, authToken, user } = useApp();
  const router = useRouter();
  const [books, setBooks] = useState<BookType[]>([]); // State to hold the list of books
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<BookType>({
    id: undefined,
    title: "",
    author: "",
    publisher: "",
    availability: "Available", // Set a default value
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    lastUpdated: new Date().toLocaleTimeString()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  //page load when authToken is available 
  useEffect(() => {
    if (!authToken && !isLoading) {
      console.log('No auth token, redirecting to auth');
      router.push('/auth');
      return;
    }

    if (user && user.role !== 'admin') {
      console.log('Non-admin user detected, redirecting to user dashboard', {
        userRole: user.role,
        userId: user.id
      });
      toast.error('Access denied. Admin privileges required.');
      router.push('/user-dashboard');
      return;
    }

    if (authToken && user?.role === 'admin') {
      console.log('Admin user detected, fetching dashboard data', {
        userId: user.id,
        userRole: user.role
      });
      fetchAllBooks();
      fetchDashboardStats();
    }
  }, [authToken, isLoading, user, router]);

  useEffect(() => {
    // TODO: Replace with actual API call
    // This is mock data for demonstration
    setStats({
      totalBooks: 0,
      totalUsers: 0,
      availableBooks: 0,
      borrowedBooks: 0,
      lastUpdated: new Date().toLocaleTimeString()
    });
  }, []);

  //On change form input
  const handleOnChangeEvent = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

 const fetchAllBooks = async () => {
    if (!authToken) {
      setBooks([]);
      return [];
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );
      
      console.log('Raw API response:', response.data); // Debug log
      
      // Handle different possible response formats
      let booksData;
      if (Array.isArray(response.data)) {
        booksData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        booksData = response.data.data;
      } else if (response.data.books && Array.isArray(response.data.books)) {
        booksData = response.data.books;
      } else {
        booksData = [];
        console.warn('Unexpected API response format:', response.data);
      }
      
      console.log('Processed books data:', booksData); // Debug log
      setBooks(booksData);
      return booksData;
    } catch (error: any) {
      console.error('Error fetching books:', error);
      if (error.response?.status === 401) {
        router.push('/auth');
      }
      setBooks([]);
      return [];
    }
  };

  // Update the resetForm function to use the same default values
  const resetForm = () => {
    setFormData({
      id: undefined,
      title: "",
      author: "",
      publisher: "",
      availability: "Available", // Use the same default value
    });
  };

  // Update the edit button click handler
  const handleEditClick = (singleBook: BookType) => {
    setFormData({
      id: singleBook.id,
      title: singleBook.title,
      author: singleBook.author,
      publisher: singleBook.publisher,
      availability: singleBook.availability || 'Available',
    });
    setIsEdit(true);
  };

  const handleDeleteBook = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        setBooks(books.filter(book => book.id !== id));
        Swal.fire("Deleted!", "Book has been deleted.", "success");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      Swal.fire("Error!", "Failed to delete book.", "error");
    }
  };

  //form subbimission 
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        availability: formData.availability || "Available",
      };
  
      let response;
      if (formData.id) {
        // UPDATE REQUEST (PUT/PATCH)
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/books/${formData.id}`,
          bookData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // CREATE REQUEST (POST)
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books`,
          bookData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
  
      if (response.data) {
        toast.success(formData.id ? "Book updated!" : "Book added!");
        resetForm();
        await fetchAllBooks(); // Refresh the list
      }
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to save book.");
    }
  };

  const availabilityPercentage = stats.totalBooks > 0 
    ? (stats.availableBooks / stats.totalBooks) * 100 
    : 0;

  const fetchDashboardStats = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`;
    const requestId = Math.random().toString(36).substring(2, 9);
    
    console.log(`[${requestId}] Starting dashboard stats request`, {
      hasAuthToken: !!authToken,
      userRole: user?.role,
      isAdmin: user?.role === 'admin'
    });

    if (!authToken) {
      console.log(`[${requestId}] No auth token available`);
      router.push('/auth');
      return;
    }

    if (!user || user.role !== 'admin') {
      console.log(`[${requestId}] Non-admin user attempting to access dashboard stats`, {
        userRole: user?.role,
        userId: user?.id
      });
      toast.error('Access denied. Admin privileges required.');
      router.push('/user-dashboard');
      return;
    }

    try {
      setIsRefreshing(true);
    
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[${requestId}] API error:`, {
          status: response.status,
          statusText: response.statusText,
          errorData
        });

        if (response.status === 403) {
          toast.error('Admin privileges required');
          router.push('/user-dashboard');
          return;
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
    
      if (!data || typeof data !== 'object' || !data.success || !data.data) {
         console.error(`[${requestId}] Invalid response structure:`, data);
        throw new Error(data?.message || 'Invalid response format from server');
      }

      setStats({
        totalBooks: Number(data.data?.totalBooks ?? 0),
        totalUsers: Number(data.data?.totalUsers ?? 0),
        availableBooks: Number(data.data?.availableBooks ?? 0),
        borrowedBooks: Number(data.data?.borrowedBooks ?? 0),
        lastUpdated: new Date().toLocaleTimeString()
      });
      
       console.log(`[${requestId}] Stats updated successfully`);

    } catch (error: any) {
      console.error(`[${requestId}] Error fetching dashboard stats:`, {
        error,
        message: error.message,
        status: error.status,
        userRole: user?.role
      });
      
      if (error.name === 'AbortError') {
        toast.error('Request timed out');
      } else if (error.message.includes('Admin privileges required')) {
        toast.error('Admin privileges required');
        router.push('/user-dashboard');
      } else {
        toast.error(error.message || 'Failed to load dashboard stats');
      }
    } finally {
      setIsRefreshing(false);
       console.log(`[${requestId}] Dashboard stats request finished`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#3b258c]">
      <div className="flex flex-1">
        {/* Sidebar is handled by Sidebar.tsx */}
        <main className="flex-1 p-8 md:ml-64">
          <h1 className="text-3xl font-extrabold text-[white] mb-8 font-sans">Admin Dashboard</h1>
          {/* Metrics Cards */}
          <div className="flex w-full justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-4xl w-full">
              <div className="min-h-[140px] w-full flex flex-col justify-center items-start p-8 font-sans rounded-2xl shadow-lg" style={{background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'}}>
                <p className="text-lg text-[#6C63FF] font-semibold mb-1 font-sans">Total Books</p>
                <h2 className="text-3xl font-extrabold text-[#3b258c] font-sans">{stats.totalBooks}</h2>
              </div>
              <div className="min-h-[140px] w-full flex flex-col justify-center items-start p-8 font-sans rounded-2xl shadow-lg" style={{background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'}}>
                <p className="text-lg text-[#43E97B] font-semibold mb-1 font-sans">Total Users</p>
                <h2 className="text-3xl font-extrabold text-[#3b258c] font-sans">{stats.totalUsers}</h2>
              </div>
              <div className="min-h-[140px] w-full flex flex-col justify-center items-start p-8 font-sans rounded-2xl shadow-lg" style={{background: 'linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)'}}>
                <p className="text-lg text-[#FFD700] font-semibold mb-1 font-sans">Available Books</p>
                <h2 className="text-3xl font-extrabold text-[#3b258c] font-sans">{stats.availableBooks}</h2>
              </div>
              <div className="min-h-[140px] w-full flex flex-col justify-center items-start p-8 font-sans rounded-2xl shadow-lg" style={{background: 'linear-gradient(135deg, #ffe4e6 0%, #fca5a5 100%)'}}>
                <p className="text-lg text-[#FF6B00] font-semibold mb-1 font-sans">Borrowed Books</p>
                <h2 className="text-3xl font-extrabold text-[#3b258c] font-sans">{stats.borrowedBooks}</h2>
              </div>
            </div>
          </div>
          {/* ... existing content ... */}
        </main>
      </div>
    </div>
  );
}