
'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../DashboardLayout'
import PropertyGrid from '../properties/PropertyGrid'
import PropertyFilters, { PropertyFilters as PropertyFiltersType } from '../properties/PropertyFilters'
import { useProperty } from '../../../../context/PropertyContext'
import { useUser } from '../../../../context/UserContext'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  ArrowPathIcon,
  DocumentArrowDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'
import { Property } from '../../../../types/property'

export default function PropertiesPage() {
  const router = useRouter()
  const { user } = useUser()
  const { adminProperties, fetchAdminProperties, loadingProperties, deleteProperty } = useProperty()
  
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [filters, setFilters] = useState<PropertyFiltersType>({} as PropertyFiltersType)
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch properties on mount
  useEffect(() => {
    if (user) {
      fetchAdminProperties()
    }
  }, [user, fetchAdminProperties])

  // Apply filters and search
  useEffect(() => {
    if (!adminProperties) {
      setFilteredProperties([])
      return
    }

    let filtered = [...adminProperties]

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(property => property.status === activeTab)
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm) ||
        property.address.toLowerCase().includes(searchTerm) ||
        property.city.toLowerCase().includes(searchTerm) ||
        property.unitNumber?.toLowerCase().includes(searchTerm)
      )
    }

    // Apply apartment type filter
    if (filters.apartmentType) {
      filtered = filtered.filter(property => property.apartmentType === filters.apartmentType)
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(property => property.status === filters.status)
    }

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter(property => 
        property.city.toLowerCase().includes(filters.city!.toLowerCase())
      )
    }

    // Apply price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= filters.minPrice!)
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= filters.maxPrice!)
    }

    // Apply bedrooms filter
    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.features.bedrooms >= filters.bedrooms!)
    }

    // Apply bathrooms filter
    if (filters.bathrooms) {
      filtered = filtered.filter(property => property.features.bathrooms >= filters.bathrooms!)
    }

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate)
      const end = new Date(filters.endDate)
      filtered = filtered.filter(property => {
        const listedDate = new Date(property.listedDate)
        return listedDate >= start && listedDate <= end
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0
        switch (filters.sortBy) {
          case 'price':
            comparison = a.price - b.price
            break
          case 'listedDate':
            comparison = new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime()
            break
          case 'views':
            comparison = (a.views || 0) - (b.views || 0)
            break
        }
        return filters.sortOrder === 'asc' ? comparison : -comparison
      })
    }

    setFilteredProperties(filtered)
    setCurrentPage(1)
  }, [adminProperties, activeTab, filters])

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProperties = filteredProperties.slice(indexOfFirstItem, indexOfLastItem)

  // Handle filter change
  const handleFilterChange = (newFilters: PropertyFiltersType) => {
    setFilters(newFilters)
  }

  // Handle add property
  const handleAddProperty = () => {
    router.push('/dashboard/super-admin/properties/add')
  }

  // Handle edit property
  const handleEditProperty = (propertyId: string) => {
    router.push(`/dashboard/super-admin/properties/${propertyId}/edit`)
  }

  // Handle view property
  const handleViewProperty = (propertyId: string) => {
    router.push(`/dashboard/super-admin/properties/${propertyId}`)
  }

  // Handle delete property
  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      setIsDeleting(true)
      try {
        const result = await deleteProperty(propertyId)
        if (result.success) {
          // Refresh properties
          await fetchAdminProperties()
        }
      } catch (error) {
        console.error('Failed to delete property:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) return
    
    if (window.confirm(`Are you sure you want to delete ${selectedProperties.length} properties? This action cannot be undone.`)) {
      setIsDeleting(true)
      try {
        for (const propertyId of selectedProperties) {
          await deleteProperty(propertyId)
        }
        setSelectedProperties([])
        await fetchAdminProperties()
      } catch (error) {
        console.error('Failed to delete properties:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Handle export
  const handleExport = () => {
    const data = filteredProperties.map(property => ({
      ID: property._id,
      Title: property.title,
      Price: property.price,
      Address: property.address,
      City: property.city,
      State: property.state,
      Status: property.status,
      Type: property.apartmentType,
      Bedrooms: property.features.bedrooms,
      Bathrooms: property.features.bathrooms,
      'Listed Date': new Date(property.listedDate).toLocaleDateString(),
      Views: property.views || 0
    }))

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchAdminProperties()
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate stats
  const stats = {
    total: adminProperties?.length || 0,
    available: adminProperties?.filter(p => p.status === 'available').length || 0,
    rented: adminProperties?.filter(p => p.status === 'rented').length || 0,
    maintenance: adminProperties?.filter(p => p.status === 'maintenance').length || 0,
    pending: adminProperties?.filter(p => p.status === 'pending').length || 0
  }

  const tabs = [
    { id: 'all', label: 'All Properties', count: stats.total, icon: BuildingOfficeIcon },
    { id: 'available', label: 'Available', count: stats.available, icon: CheckCircleIcon },
    { id: 'rented', label: 'Rented', count: stats.rented, icon: HomeModernIcon },
    { id: 'maintenance', label: 'Maintenance', count: stats.maintenance, icon: ExclamationCircleIcon },
    { id: 'pending', label: 'Pending', count: stats.pending, icon: ClockIcon },
  ]

  return (
    <DashboardLayout activeTab="properties" onTabChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-emerald-900">Properties</h1>
              <p className="text-emerald-600 mt-2">
                Manage all properties, add new listings, and track occupancy
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loadingProperties}
                className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-5 h-5 ${loadingProperties ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {selectedProperties.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <NoSymbolIcon className="w-5 h-5" />
                  <span>Delete ({selectedProperties.length})</span>
                </button>
              )}
              <button
                onClick={handleAddProperty}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Add Property</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const colors = {
              all: 'bg-emerald-100 text-emerald-700 border-emerald-200',
              available: 'bg-green-100 text-green-700 border-green-200',
              rented: 'bg-blue-100 text-blue-700 border-blue-200',
              maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
              pending: 'bg-purple-100 text-purple-700 border-purple-200'
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`bg-white rounded-xl shadow-sm p-5 border-2 transition-all ${
                  isActive 
                    ? `border-emerald-600 shadow-md scale-[1.02]` 
                    : 'border-transparent hover:border-emerald-200 hover:shadow'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{tab.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{tab.count}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[tab.id as keyof typeof colors]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <PropertyFilters onFilterChange={handleFilterChange} />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 lg:border-l lg:border-emerald-200 lg:pl-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
                title="Grid View"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
                title="List View"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`lg:hidden p-2 rounded-lg ${
                  isFilterOpen
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {isFilterOpen && (
          <div className="lg:hidden bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-emerald-900">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 hover:bg-emerald-50 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
            <PropertyFilters onFilterChange={handleFilterChange} />
          </div>
        )}

        {/* Loading State */}
        {loadingProperties ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-emerald-700">Loading properties...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Properties Grid/List */}
            {currentProperties.length > 0 ? (
              <>
                <PropertyGrid 
                  viewMode={viewMode} 
                  properties={currentProperties}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteProperty}
                  onView={handleViewProperty}
                  selectedProperties={selectedProperties}
                  onSelectProperty={(id) => {
                    setSelectedProperties(prev =>
                      prev.includes(id)
                        ? prev.filter(p => p !== id)
                        : [...prev, id]
                    )
                  }}
                  onSelectAll={() => {
                    if (selectedProperties.length === currentProperties.length) {
                      setSelectedProperties([])
                    } else {
                      setSelectedProperties(currentProperties.map(p => p._id))
                    }
                  }}
                />

                {/* Results Summary & Pagination */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-emerald-600">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> -{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredProperties.length)}</span> of{' '}
                      <span className="font-medium">{filteredProperties.length}</span> properties
                      {activeTab !== 'all' && ` • ${tabs.find(t => t.id === activeTab)?.label}`}
                      {Object.keys(filters).length > 0 && ' • Filtered'}
                    </p>

                    {totalPages > 1 && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = currentPage
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }
                            
                            return (
                              <button
                                key={i}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-lg transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              <span className="px-2 text-emerald-500">...</span>
                              <button
                                onClick={() => handlePageChange(totalPages)}
                                className="w-10 h-10 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50"
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Empty State
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BuildingOfficeIcon className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activeTab !== 'all' 
                      ? `No ${tabs.find(t => t.id === activeTab)?.label} properties found`
                      : Object.keys(filters).length > 0
                      ? 'No matching properties found'
                      : 'No properties yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab !== 'all'
                      ? `There are currently no properties with "${tabs.find(t => t.id === activeTab)?.label}" status.`
                      : Object.keys(filters).length > 0
                      ? 'Try adjusting your filters to see more results.'
                      : 'Start by adding your first property to manage.'}
                  </p>
                  {Object.keys(filters).length > 0 || activeTab !== 'all' ? (
                    <button
                      onClick={() => {
                        setFilters({} as PropertyFiltersType)
                        setActiveTab('all')
                      }}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={handleAddProperty}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 mx-auto shadow-md hover:shadow-lg"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Add Your First Property
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}