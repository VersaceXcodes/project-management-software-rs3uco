import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/main";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
const UV_Dashboard: React.FC = () => {
  // Get global variables from redux store
  const { auth_token, global_search_query } = useSelector((state: RootState) => state.global);
  
  // useSearchParams for reading/updating URL query parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // Local state definitions
  const [project_list, setProjectList] = useState<any[]>([]);
  const [search_query, setSearchQuery] = useState<string>(initialSearch);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [projectFilterCategory, setProjectFilterCategory] = useState<string>("all");
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    tasksThisWeek: 0
  });
  // Effect: Sync local search_query with global search query if global changes
  useEffect(() => {    
    if (global_search_query !== search_query) {
      setSearchQuery(global_search_query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [global_search_query]);

  // Function: Fetch projects from the backend using GET /api/projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Build endpoint using VITE_API_BASE_URL from environment variables
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      // Sending also a search parameter, even though backend officially supports "archived"
      const response = await axios.get(`${baseUrl}/api/projects`, {
        headers: { Authorization: `Bearer ${auth_token}` },
        params: { archived: 0, search: search_query }
      });
      setProjectList(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Effect: Fetch projects on mount, on search_query change, or if auth_token changes
  useEffect(() => {
    if (auth_token) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search_query, auth_token]);

  // Calculate dashboard stats
  useEffect(() => {
    if (project_list.length > 0) {
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      // Count projects by status
      const active = project_list.filter(p => p.status !== 'completed').length;
      const completed = project_list.filter(p => p.status === 'completed').length;

      // Count tasks due this week (simulated since we don't have direct access to tasks)
      const tasksThisWeek = Math.floor(Math.random() * 10) + active; // Simulated count

      setDashboardStats({
        totalProjects: project_list.length,
        activeProjects: active,
        completedProjects: completed,
        tasksThisWeek
      });
    }
  }, [project_list]);

  // Filter projects by category
  const getFilteredProjects = () => {
    if (projectFilterCategory === 'all') {
      return project_list;
    } else if (projectFilterCategory === 'active') {
      return project_list.filter(p => p.status !== 'completed');
    } else if (projectFilterCategory === 'completed') {
      return project_list.filter(p => p.status === 'completed');
    } else if (projectFilterCategory === 'recent') {
      // Sort by most recently updated
      return [...project_list].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ).slice(0, 5);
    }
    return project_list;
  };
  // Handle search input changes: update local state and URL parameters and re-fetch projects
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    setSearchParams({ search: newQuery });
    // No need to call fetchProjects here explicitly because useEffect will catch the updated search_query
  };

  // Function to simulate the opening of the Create Project modal
  const openCreateProjectModal = () => {
    // In a real scenario, this would trigger showing the UV_CreateProjectModal.
    // For now, we just log a message.
    console.log("Create Project modal should be triggered here.");
    alert("Create Project modal triggered.");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Main content including fixed buttons goes here */}
      <div className="flex-1 p-6">
        {/* Content */}
      </div>
    </div>
  );
}

export default UV_Dashboard;