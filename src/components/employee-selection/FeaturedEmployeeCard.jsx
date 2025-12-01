import React from 'react';
import EmployeeCard from './EmployeeCard';

function FeaturedEmployeeCard({ employee, onSelect, onPreview }) {
  return (
    <EmployeeCard
      employee={{ ...employee, isRecommended: true }}
      onSelect={onSelect}
      onPreview={onPreview}
      isFeatured={true}
    />
  );
}

export default FeaturedEmployeeCard;



