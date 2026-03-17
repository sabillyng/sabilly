"use client";
import { useParams } from 'next/navigation';
import { Navbar } from '../../../components/Home/Navbar';
import { CategorySidebar } from '../../../components/Home/CategorySidebar';
import { ServicesList } from '../../../components/services/ServicesList';
import { useState, useEffect } from 'react';
import { useService } from '../../../context/ServiceContext';

const categoryNames: Record<string, string> = {
  plumbing: 'Plumbing Services',
  electrical: 'Electrical Services',
  painting: 'Painting Services',
  carpentry: 'Carpentry Services',
  cleaning: 'Cleaning Services',
  moving: 'Moving & Haulage Services',
  'it-services': 'IT & Computer Services',
  photography: 'Photography Services',
  beauty: 'Beauty & Hair Services',
  'home-repairs': 'Home Repair Services',
  construction: 'Construction Services',
  business: 'Business Services'
};

// Map URL slugs to actual category names in your database
const slugToCategory: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  painting: 'Painting',
  carpentry: 'Carpentry',
  cleaning: 'Cleaning',
  moving: 'Moving & Haulage',
  'it-services': 'IT Services',
  photography: 'Photography',
  beauty: 'Beauty & Hair',
  'home-repairs': 'Home Repairs',
  construction: 'Construction',
  business: 'Business Services'
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { getServices } = useService();
  
  const categorySlug = Array.isArray(slug) ? slug[0] : slug;
  const categoryName = categoryNames[categorySlug] || 'Services';
  const dbCategory = slugToCategory[categorySlug] || categorySlug;

  // Load services for this category on mount
  useEffect(() => {
    getServices({ category: dbCategory, limit: 12 });
  }, [categorySlug, getServices, dbCategory]);

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-600">
            Find trusted professionals for all your {categoryName.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-80 ${showMobileMenu ? 'block' : 'hidden lg:block'}`}>
            <CategorySidebar onCategorySelect={() => setShowMobileMenu(false)} />
          </div>

          {/* Main content */}
          <div className="flex-1">
            <ServicesList 
              filters={{ category: dbCategory }}
              showFilters={true}
            />
          </div>
        </div>
      </main>
    </>
  );
}