import React from 'react';
import { Card, CardContent } from '../ui/card';
import { AnimatedIcon } from '../../utils/animatedIcons';

interface EnhancementEmptyStateProps {
  title: string;
  description: string;
  iconName?: string;
  className?: string;
}

export const EnhancementEmptyState: React.FC<EnhancementEmptyStateProps> = ({
  title,
  description,
  iconName = 'no-data',
  className = ''
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        <div className="text-center">
          <AnimatedIcon 
            iconName={iconName} 
            className="h-12 w-12 mx-auto mb-3 text-gray-400" 
            alt="" 
          />
          <h4 className="text-md font-medium text-gray-700 mb-2">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};