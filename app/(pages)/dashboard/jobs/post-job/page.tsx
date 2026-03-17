"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../../context/UserContext';
import { Navbar } from '../../../../components/Home/Navbar';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface JobFormData {
  title: string;
  category: string;
  subcategory: string;
  location: string;
  description: string;
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin: string;
  budgetMax: string;
  experience: 'entry' | 'intermediate' | 'expert';
  duration: string;
  startDate: string;
  skills: string[];
  attachments: File[];
  questions: string[];
}

export default function PostJobPage() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    category: '',
    subcategory: '',
    location: '',
    description: '',
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    experience: 'intermediate',
    duration: '',
    startDate: '',
    skills: [],
    attachments: [],
    questions: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');

  const categories = [
    {
      name: 'Plumbing',
      subcategories: ['Pipe Repair', 'Leak Detection', 'Water Heater Installation', 'Drain Cleaning']
    },
    {
      name: 'Electrical',
      subcategories: ['Wiring', 'Lighting Installation', 'Circuit Breaker', 'Fan Installation']
    },
    {
      name: 'Painting',
      subcategories: ['Interior Painting', 'Exterior Painting', 'Wallpaper Installation', 'Texture Coating']
    },
    {
      name: 'Carpentry',
      subcategories: ['Furniture Making', 'Cabinet Installation', 'Wood Repair', 'Deck Building']
    },
    {
      name: 'Cleaning',
      subcategories: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Carpet Cleaning']
    },
    {
      name: 'Moving',
      subcategories: ['Local Moving', 'Long Distance', 'Packing Services', 'Furniture Assembly']
    },
    {
      name: 'IT Services',
      subcategories: ['Computer Repair', 'Network Setup', 'Software Installation', 'Data Recovery']
    },
    {
      name: 'Photography',
      subcategories: ['Event Photography', 'Portrait', 'Product Photography', 'Videography']
    },
    {
      name: 'Home Repairs',
      subcategories: ['General Repairs', 'Furniture Repair', 'Appliance Repair', 'Door/Window Repair']
    },
    {
      name: 'Construction',
      subcategories: ['Renovation', 'Tiling', 'Roofing', 'Masonry']
    }
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level', description: 'Budget-friendly, less experience' },
    { value: 'intermediate', label: 'Intermediate', description: 'Good balance of experience and cost' },
    { value: 'expert', label: 'Expert', description: 'Top professionals, premium quality' }
  ];

  const durations = [
    'Less than 1 day',
    '1-3 days',
    '3-7 days',
    '1-2 weeks',
    '2-4 weeks',
    '1-3 months',
    'Ongoing'
  ];

  const handleInputChange = (field: keyof JobFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addQuestion = () => {
    if (questionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, questionInput.trim()]
      }));
      setQuestionInput('');
    }
  };

  const removeQuestion = (questionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q !== questionToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateStep1 = () => {
    if (!formData.title) return 'Please enter a job title';
    if (!formData.category) return 'Please select a category';
    if (!formData.location) return 'Please enter a location';
    if (!formData.description) return 'Please enter a job description';
    if (formData.description.length < 50) return 'Description should be at least 50 characters';
    return '';
  };

  const validateStep2 = () => {
    if (formData.budgetType !== 'negotiable') {
      if (!formData.budgetMin) return 'Please enter minimum budget';
      if (!formData.budgetMax) return 'Please enter maximum budget';
      if (parseInt(formData.budgetMin) > parseInt(formData.budgetMax)) {
        return 'Minimum budget cannot be greater than maximum budget';
      }
    }
    if (!formData.duration) return 'Please select estimated duration';
    if (formData.skills.length === 0) return 'Please add at least one required skill';
    return '';
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      const validationError = validateStep1();
      if (validationError) {
        setError(validationError);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const validationError = validateStep2();
      if (validationError) {
        setError(validationError);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Here you would make an API call to create the job
      console.log('Submitting job:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Redirect to dashboard on success
      router.push('/dashboard/jobs/posted?success=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'customer') {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Only customers can post jobs. Please sign in as a customer.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Sign In as Customer
          </button>
        </div>
      </>
    );
  }

  return (
    <>      
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step < currentStep
                    ? 'bg-emerald-600 text-white'
                    : step === currentStep
                    ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-600">Basic Info</span>
            <span className="text-gray-600">Budget & Skills</span>
            <span className="text-gray-600">Review & Post</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Need a plumber to fix leaking sink"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange('category', e.target.value);
                      handleInputChange('subcategory', '');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {formData.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select subcategory</option>
                      {categories
                        .find(c => c.name === formData.category)
                        ?.subcategories.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Ile-Ife, Osun State"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe your job in detail. Include specific requirements, measurements, etc."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 50 characters. {formData.description.length}/50
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Skills */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Budget & Requirements</h2>

              {/* Budget Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Budget Type
                </label>
                <div className="flex space-x-4">
                  {(['fixed', 'hourly', 'negotiable'] as const).map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        value={type}
                        checked={formData.budgetType === type}
                        onChange={(e) => handleInputChange('budgetType', e.target.value)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              {formData.budgetType !== 'negotiable' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Budget (₦)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.budgetMin}
                        onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Budget (₦)
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.budgetMax}
                        onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="25000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Experience Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {experienceLevels.map((level) => (
                    <label
                      key={level.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.experience === level.value
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={level.value}
                        checked={formData.experience === level.value}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="sr-only"
                      />
                      <h3 className="font-medium text-gray-900">{level.label}</h3>
                      <p className="text-sm text-gray-500 mt-1">{level.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select duration</option>
                  {durations.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Start Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Plumbing"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-emerald-700 hover:text-emerald-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, images, documents (Max 10MB each)
                    </span>
                  </label>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Questions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Review & Additional Questions</h2>

              {/* Screening Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screening Questions (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Add questions to help filter applicants
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., How many years of experience do you have?"
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-700">{question}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Job Summary</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Title:</dt>
                    <dd className="font-medium text-gray-900">{formData.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Category:</dt>
                    <dd className="text-gray-900">{formData.category} {formData.subcategory && `› ${formData.subcategory}`}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Location:</dt>
                    <dd className="text-gray-900">{formData.location}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Budget:</dt>
                    <dd className="text-gray-900">
                      {formData.budgetType === 'negotiable' 
                        ? 'Negotiable'
                        : `₦${parseInt(formData.budgetMin).toLocaleString()} - ₦${parseInt(formData.budgetMax).toLocaleString()}`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Duration:</dt>
                    <dd className="text-gray-900">{formData.duration || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Skills:</dt>
                    <dd className="text-gray-900">{formData.skills.join(', ')}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <div className="flex-1" />
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Tips Box */}
        <div className="mt-8 bg-emerald-50 rounded-lg border border-emerald-200 p-6">
          <h3 className="font-semibold text-emerald-900 mb-3">💡 Tips for a Great Job Post</h3>
          <ul className="space-y-2 text-sm text-emerald-800">
            <li>• Be specific about the work required and any measurements</li>
            <li>• Include photos or documents to help professionals understand the job</li>
            <li>• Set a realistic budget range based on market rates</li>
            <li>• Ask relevant screening questions to find the best match</li>
            <li>• Respond to applications promptly to keep professionals engaged</li>
          </ul>
        </div>
      </main>
    </>
  );
}