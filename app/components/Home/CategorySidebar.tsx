"use client";
import Link from 'next/link';
import { 
  WrenchIcon,
  HomeIcon,
  PaintBrushIcon,
  BoltIcon,
  HomeModernIcon,
  SparklesIcon,
  ScissorsIcon,
  TruckIcon,
  ComputerDesktopIcon,
  CameraIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const serviceCategories = [
  { name: 'Plumbing', icon: HomeModernIcon, count: '12.5k', href: '/category/plumbing' },
  { name: 'Electrical', icon: BoltIcon, count: '15.2k', href: '/category/electrical' },
  { name: 'Painting', icon: PaintBrushIcon, count: '8.7k', href: '/category/painting' },
  { name: 'Carpentry', icon: WrenchIcon, count: '9.3k', href: '/category/carpentry' },
  { name: 'Cleaning', icon: SparklesIcon, count: '18.1k', href: '/category/cleaning' },
  { name: 'Moving & Haulage', icon: TruckIcon, count: '6.4k', href: '/category/moving' },
  { name: 'IT Services', icon: ComputerDesktopIcon, count: '11.2k', href: '/category/it-services' },
  { name: 'Photography', icon: CameraIcon, count: '7.8k', href: '/category/photography' },
  { name: 'Beauty & Hair', icon: ScissorsIcon, count: '14.5k', href: '/category/beauty' },
  { name: 'Home Repairs', icon: HomeIcon, count: '22.3k', href: '/category/home-repairs' },
  { name: 'Construction', icon: BuildingOfficeIcon, count: '9.1k', href: '/category/construction' },
  { name: 'Business Services', icon: BriefcaseIcon, count: '16.7k', href: '/category/business' },
];

interface CategorySidebarProps {
  onCategorySelect?: () => void;
}

export function CategorySidebar({ onCategorySelect }: CategorySidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <h2 className="font-bold text-lg mb-4">Service Categories</h2>
        <ul className="space-y-2">
          {serviceCategories.map((category) => (
            <li key={category.name}>
              <Link
                href={category.href}
                onClick={onCategorySelect}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <category.icon className="h-5 w-5 text-gray-400 group-hover:text-emerald-600" />
                  <span className="text-gray-700 group-hover:text-emerald-600">{category.name}</span>
                </div>
                <span className="text-sm text-gray-500">{category.count} pros</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick links for different user types */}
      <div className="border-t border-gray-200 p-4">
        <h3 className="font-medium text-sm text-gray-500 mb-3">FOR PROFESSIONALS</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/how-to-join" className="text-gray-700 hover:text-emerald-600 text-sm">
              Become an Artisan
            </Link>
          </li>
          <li>
            <Link href="/business/register" className="text-gray-700 hover:text-emerald-600 text-sm">
              Register Your Business
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="text-gray-700 hover:text-emerald-600 text-sm">
              Pricing & Plans
            </Link>
          </li>
        </ul>
      </div>

      <div className="border-t border-gray-200 p-4">
        <h3 className="font-medium text-sm text-gray-500 mb-3">FOR CUSTOMERS</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/how-it-works" className="text-gray-700 hover:text-emerald-600 text-sm">
              How it Works
            </Link>
          </li>
          <li>
            <Link href="/post-job" className="text-gray-700 hover:text-emerald-600 text-sm">
              Post a Job
            </Link>
          </li>
          <li>
            <Link href="/safety-tips" className="text-gray-700 hover:text-emerald-600 text-sm">
              Safety Tips
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}