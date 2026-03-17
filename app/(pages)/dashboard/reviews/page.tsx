"use client";
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ReviewsPage() {
  // Mock data - replace with real API calls
  const reviews = [
    {
      id: 1,
      from: 'John Doe',
      avatar: null,
      rating: 5,
      comment: 'Excellent work! Very professional and completed the job on time. Highly recommended!',
      date: '2024-03-15',
      job: 'Plumbing Repair'
    },
    {
      id: 2,
      from: 'Sarah Okafor',
      avatar: null,
      rating: 4,
      comment: 'Good quality work. Would recommend.',
      date: '2024-03-10',
      job: 'Electrical Wiring'
    },
    {
      id: 3,
      from: 'Mike Obi',
      avatar: null,
      rating: 5,
      comment: 'Very skilled and professional. Will hire again.',
      date: '2024-03-05',
      job: 'House Painting'
    }
  ];

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600">See what customers are saying about your work</p>
      </div>

      {/* Rating Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500 mt-1">out of 5</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="flex items-center mr-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIconSolid
                    key={star}
                    className={`h-5 w-5 ${
                      star <= averageRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{reviews.length} reviews</span>
            </div>
            {/* Rating breakdown */}
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter(r => r.rating === stars).length;
              const percentage = (count / reviews.length) * 100;
              return (
                <div key={stars} className="flex items-center space-x-2 text-sm">
                  <span className="w-8">{stars} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-emerald-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.from}</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIconSolid
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 mb-2">{review.comment}</p>
            <p className="text-sm text-gray-500">Job: {review.job}</p>
          </div>
        ))}
      </div>
    </div>
  );
}