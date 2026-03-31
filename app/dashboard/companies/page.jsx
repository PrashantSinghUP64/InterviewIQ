"use client";

import React, { useState, useEffect } from "react";
import { Building2, Search, Loader2, Sparkles, Code2, Users, Building, ChevronRight, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { chatSession } from "@/utils/GeminiAIModal";
import { useRouter } from "next/navigation";

// Hardcoded List of 25 Companies with categories
// The companies will be fetched from the database
const CATEGORIES = ["All", "Big Tech", "WITCH", "Unicorn", "FinTech"];

const CompaniesPage = () => {
  const [COMPANIES, setCOMPANIES] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (data.success) {
        setCOMPANIES(data.companies);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  // Filter Logic
  const filteredCompanies = COMPANIES.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
    setCompanyData(null); // clear prev data
    
    // Fetch from backend (which checks Neon DB cache first, then Groq)
    setLoading(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: company.name })
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setCompanyData(data.data);
      } else {
        throw new Error("Invalid response");
      }
    } catch(err) {
      console.error(err);
      setCompanyData({
        rounds: ["Information currently unavailable"],
        techStack: "Various",
        culture: "Fast-paced environment.",
        commonTopics: ["Data Structures", "System Design"]
      });
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill AddNewInterview format by routing to dashboard with quick param (if we implement a ?company= feature)
  // Or simply route to Dashboard to create an interview
  const startPractice = () => {
    // We will pass the company parameter via localStorage or query param
    localStorage.setItem("pendingCompanyInterview", selectedCompany.name);
    router.push("/dashboard");
  };

  return (
    <div className="py-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Company Insights</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 ml-[52px] text-sm md:text-base">
          Explore interview processes, common rounds, and practice tailored questions.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                  : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search companies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCompanies.map((company, idx) => (
          <div 
            key={company.name}
            onClick={() => handleCompanyClick(company)}
            className="group cursor-pointer flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-100/60 dark:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xl font-black text-slate-700 dark:text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/50 transition-colors duration-300">
              {company.logoUrl || company.name.charAt(0)}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">{company.name}</h3>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">{company.category}</p>
            </div>
          </div>
        ))}
        {initialLoading && (
          <div className="col-span-full py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}
        {!initialLoading && filteredCompanies.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">
            No companies found matching your criteria.
          </div>
        )}
      </div>

      {/* Modal Profile */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl shadow-black">
           {selectedCompany && (
             <div className="flex flex-col h-full">
                {/* Header Banner */}
                <div className="relative h-24 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-b border-indigo-500/20">
                  <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/40 flex items-center justify-center text-2xl font-black text-indigo-400 shadow-xl">
                    {selectedCompany.logoUrl || selectedCompany.name.charAt(0)}
                  </div>
                </div>

                <div className="px-6 pt-10 pb-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedCompany.name}</DialogTitle>
                      <DialogDescription className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5 uppercase tracking-widest">{selectedCompany.category}</DialogDescription>
                    </div>
                    
                    <button onClick={startPractice} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all w-fit">
                      <Sparkles className="w-4 h-4" /> Practice Interview
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Gathering insights from AI...</p>
                    </div>
                  ) : companyData ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      
                      {/* Tech Stack & Culture */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Code2 className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Tech Stack</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{companyData.techStack}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <Users className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Culture</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{companyData.culture}</p>
                        </div>
                      </div>

                      {/* Common Topics */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"><Briefcase className="w-4 h-4 text-slate-500"/> Core Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {companyData.commonTopics.map((t, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rounds */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"><Building className="w-4 h-4 text-slate-500"/> Interview Rounds</h4>
                        <div className="space-y-3">
                          {companyData.rounds.map((r, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                                {i + 1}
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">{r}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 text-sm">Failed to load insights.</div>
                  )}
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage;
