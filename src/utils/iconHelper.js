import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  MegaphoneIcon,
  SparklesIcon,
  CpuChipIcon,
  LinkIcon,
  UserPlusIcon,
  HandRaisedIcon,
  RocketLaunchIcon,
  CogIcon,
  LightBulbIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  CommandLineIcon,
  ShieldCheckIcon,
  HeartIcon,
  LifebuoyIcon,
  TrophyIcon,
  GiftIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  GiftTopIcon,
} from '@heroicons/react/24/outline';

// Map icon names to Heroicon components
const iconMap = {
  'ChatBubbleLeftRightIcon': ChatBubbleLeftRightIcon,
  'UserCircleIcon': UserCircleIcon,
  'MegaphoneIcon': MegaphoneIcon,
  'SparklesIcon': SparklesIcon,
  'CpuChipIcon': CpuChipIcon,
  'LinkIcon': LinkIcon,
  'UserPlusIcon': UserPlusIcon,
  'HandRaisedIcon': HandRaisedIcon,
  'RocketLaunchIcon': RocketLaunchIcon,
  'CogIcon': CogIcon,
  'LightBulbIcon': LightBulbIcon,
  'StarIcon': StarIcon,
  'FireIcon': FireIcon,
  'BoltIcon': BoltIcon,
  'CommandLineIcon': CommandLineIcon,
  'ShieldCheckIcon': ShieldCheckIcon,
  'HeartIcon': HeartIcon,
  'LifebuoyIcon': LifebuoyIcon,
  'TrophyIcon': TrophyIcon,
  'GiftIcon': GiftIcon,
  'PuzzlePieceIcon': PuzzlePieceIcon,
  'GlobeAltIcon': GlobeAltIcon,
  'CheckBadgeIcon': CheckBadgeIcon,
  'GiftTopIcon': GiftTopIcon,
  'TargetIcon': CommandLineIcon, // TargetIcon doesn't exist, using CommandLineIcon as replacement
};

/**
 * Get Heroicon component by name
 * @param {string} iconName - Name of the icon component
 * @returns {React.Component|null} - Heroicon component or null if not found
 */
export const getIconComponent = (iconName) => {
  if (!iconName) return null;
  
  // If it's already a component (for backward compatibility with emojis)
  if (typeof iconName === 'function') {
    return iconName;
  }
  
  // If it's a string, look it up in the map
  return iconMap[iconName] || null;
};

export default getIconComponent;

