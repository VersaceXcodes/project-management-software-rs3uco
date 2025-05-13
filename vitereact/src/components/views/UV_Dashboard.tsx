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
      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-30 bg-blue-600 text-white p-2 rounded-full shadow-lg md:hidden"
      >
        {sidebarOpen ? "×" : "☰"}
      </button>

      {/* Sidebar Panel */}
      <motion.div
        className={`fixed left-0 top-0 z-20 h-full w-64 bg-white shadow-lg transform 
                   ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:relative md:translate-x-0 md:z-0 transition-transform duration-300 ease-in-out`}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setProjectFilterCategory('all')}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                projectFilterCategory === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setProjectFilterCategory('active')}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                projectFilterCategory === 'active' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Active Projects
            </button>
            <button
              onClick={() => setProjectFilterCategory('completed')}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                projectFilterCategory === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completed Projects
            </button>
            <button
              onClick={() => setProjectFilterCategory('recent')}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                projectFilterCategory === 'recent' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Recent Updates
            </button>
          </nav>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 p-6">
        {/* Search and Create Project Buttons */}
        <div className="flex justify-between mb-6">
          <div className="relative w-full max-w-md mr-4">
            <input
              type="text"
              placeholder="Search projects..."
              value={search_query}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>
          <button
            onClick={openCreateProjectModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Project
          </button>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{dashboardStats.totalProjects}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{dashboardStats.activeProjects}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{dashboardStats.completedProjects}</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tasks This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{dashboardStats.tasksThisWeek}</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {projectFilterCategory === 'all' ? 'All Projects' :
           projectFilterCategory === 'active' ? 'Active Projects' :
           projectFilterCategory === 'completed' ? 'Completed Projects' :
           'Recently Updated Projects'}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : getFilteredProjects().length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-lg text-gray-600">No projects found</p>
            <button 
              onClick={openCreateProjectModal}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center shadow-md transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {getFilteredProjects().map((project: any) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="block">
                <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-amber-100 text-amber-800'}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    <CardDescription className="text-gray-500">
                      {new Date(project.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 line-clamp-2">{project.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 border-t">
                    <div className="w-full flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {/* Simulate team members avatars */}
                        {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Tasks: {Math.floor(Math.random() * 5) + 1}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UV_Dashboard;