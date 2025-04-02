import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const sampleVendors = [
  {
    name: "Spice Garden",
    cuisine: "North Indian",
    rating: 4.7,
    deliveryTime: "30-45 mins",
    description: "Authentic Punjabi flavors with homemade spices",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    minOrder: 2,
    deliveryFee: 20,
    tiffinOptions: {
      baseOptions: [
        {
          id: 'veg',
          name: 'Vegetarian',
          basePrice: 80,
          description: 'Pure vegetarian meals with fresh vegetables',
          default: true
        },
        {
          id: 'non-veg',
          name: 'Non-Vegetarian',
          basePrice: 100,
          description: 'Includes chicken or other meat options'
        }
      ],
      portionSizes: [
        {
          id: 'half',
          name: 'Half Portion',
          multiplier: 0.6,
          description: '60% of full portion'
        },
        {
          id: 'full',
          name: 'Full Portion',
          multiplier: 1,
          description: 'Standard portion size',
          default: true
        }
      ],
      addOns: [
        {
          id: 'salad',
          name: 'Extra Salad',
          price: 20,
          description: 'Fresh vegetable salad'
        },
        {
          id: 'dessert',
          name: 'Dessert',
          price: 30,
          description: 'Daily sweet dish'
        },
        {
          id: 'papad',
          name: 'Papad',
          price: 10,
          description: 'Crispy lentil wafers'
        }
      ],
      specialInstructions: {
        maxLength: 100,
        examples: "Less spicy, No onion, Extra gravy"
      }
    },
    menu: [
      { name: "Paneer Butter Masala", price: 120 },
      { name: "Dal Makhani", price: 100 },
      { name: "Tandoori Roti", price: 15 }
    ]
  },
  {
    name: "Curry Leaves",
    cuisine: "South Indian",
    rating: 4.5,
    deliveryTime: "25-40 mins",
    description: "Traditional Kerala meals served on banana leaves",
    image: "https://images.unsplash.com/photo-1633332758795-9a3961a0d95c",
    minOrder: 3,
    deliveryFee: 15,
    tiffinOptions: {
      baseOptions: [
        {
          id: 'veg',
          name: 'Vegetarian',
          basePrice: 70,
          description: 'Traditional vegetarian meals',
          default: true
        },
        {
          id: 'non-veg',
          name: 'Non-Vegetarian',
          basePrice: 90,
          description: 'Includes fish or chicken options'
        }
      ],
      portionSizes: [
        {
          id: 'half',
          name: 'Half Portion',
          multiplier: 0.6,
          description: '60% of full portion'
        },
        {
          id: 'full',
          name: 'Full Portion',
          multiplier: 1,
          description: 'Standard portion size',
          default: true
        }
      ],
      addOns: [
        {
          id: 'chutney',
          name: 'Extra Chutney',
          price: 15,
          description: 'Coconut or tomato chutney'
        },
        {
          id: 'sambar',
          name: 'Extra Sambar',
          price: 25,
          description: 'Lentil vegetable stew'
        },
        {
          id: 'coffee',
          name: 'Filter Coffee',
          price: 30,
          description: 'Traditional South Indian coffee'
        }
      ],
      specialInstructions: {
        maxLength: 100,
        examples: "Less salt, Extra sambar, No garlic"
      }
    },
    menu: [
      { name: "Masala Dosa", price: 80 },
      { name: "Sambar Rice", price: 90 },
      { name: "Filter Coffee", price: 25 }
    ]
  },
  {
    name: "Dum Biryani House",
    cuisine: "Hyderabadi",
    rating: 4.8,
    deliveryTime: "40-55 mins",
    description: "Authentic dum-cooked biryanis with secret recipes",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a",
    minOrder: 1,
    deliveryFee: 25,
    tiffinOptions: {
      baseOptions: [
        {
          id: 'veg',
          name: 'Vegetarian Biryani',
          basePrice: 120,
          description: 'Vegetable dum biryani'
        },
        {
          id: 'non-veg',
          name: 'Chicken Biryani',
          basePrice: 150,
          description: 'Hyderabadi chicken dum biryani',
          default: true
        }
      ],
      portionSizes: [
        {
          id: 'half',
          name: 'Half Portion',
          multiplier: 0.5,
          description: '50% of full portion'
        },
        {
          id: 'full',
          name: 'Full Portion',
          multiplier: 1,
          description: 'Standard portion size',
          default: true
        }
      ],
      addOns: [
        {
          id: 'mirchi',
          name: 'Mirchi Ka Salan',
          price: 50,
          description: 'Spicy chili curry'
        },
        {
          id: 'raita',
          name: 'Biryani Raita',
          price: 30,
          description: 'Cooling yogurt side'
        },
        {
          id: 'salad',
          name: 'Onion Salad',
          price: 20,
          description: 'Fresh onion rings with lemon'
        }
      ],
      specialInstructions: {
        maxLength: 100,
        examples: "Extra spicy, Less oil, No boiled egg"
      }
    },
    menu: [
      { name: "Chicken Biryani", price: 150 },
      { name: "Veg Biryani", price: 120 },
      { name: "Mirchi Ka Salan", price: 50 }
    ]
  },
  {
    name: "Thai Wok",
    cuisine: "Thai",
    rating: 4.6,
    deliveryTime: "35-50 mins",
    description: "Authentic Thai curries and stir-fries",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    minOrder: 2,
    deliveryFee: 30,
    tiffinOptions: {
      baseOptions: [
        {
          id: 'veg',
          name: 'Vegetarian',
          basePrice: 140,
          description: 'Vegetable Thai curry'
        },
        {
          id: 'non-veg',
          name: 'Non-Vegetarian',
          basePrice: 160,
          description: 'With chicken or shrimp',
          default: true
        }
      ],
      portionSizes: [
        {
          id: 'half',
          name: 'Half Portion',
          multiplier: 0.7,
          description: '70% of full portion'
        },
        {
          id: 'full',
          name: 'Full Portion',
          multiplier: 1,
          description: 'Standard portion size',
          default: true
        }
      ],
      addOns: [
        {
          id: 'rice',
          name: 'Extra Rice',
          price: 40,
          description: 'Jasmine rice'
        },
        {
          id: 'spring',
          name: 'Spring Rolls',
          price: 60,
          description: 'Vegetable spring rolls'
        },
        {
          id: 'soup',
          name: 'Tom Yum Soup',
          price: 90,
          description: 'Spicy Thai soup'
        }
      ],
      specialInstructions: {
        maxLength: 120,
        examples: "Thai spicy level, No peanuts, Extra vegetables"
      }
    },
    menu: [
      { name: "Pad Thai", price: 140 },
      { name: "Green Curry", price: 160 },
      { name: "Tom Yum Soup", price: 90 }
    ]
  },
  {
    name: "Pasta Piazza",
    cuisine: "Italian",
    rating: 4.4,
    deliveryTime: "25-40 mins",
    description: "Fresh pasta dishes with authentic Italian recipes",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb",
    minOrder: 1,
    deliveryFee: 25,
    tiffinOptions: {
      baseOptions: [
        {
          id: 'veg',
          name: 'Vegetarian',
          basePrice: 180,
          description: 'Vegetable pasta',
          default: true
        },
        {
          id: 'non-veg',
          name: 'Non-Vegetarian',
          basePrice: 200,
          description: 'With chicken or seafood'
        }
      ],
      portionSizes: [
        {
          id: 'half',
          name: 'Half Portion',
          multiplier: 0.6,
          description: '60% of full portion'
        },
        {
          id: 'full',
          name: 'Full Portion',
          multiplier: 1,
          description: 'Standard portion size',
          default: true
        }
      ],
      addOns: [
        {
          id: 'bread',
          name: 'Garlic Bread',
          price: 50,
          description: 'Freshly baked'
        },
        {
          id: 'salad',
          name: 'Caesar Salad',
          price: 70,
          description: 'With dressing'
        },
        {
          id: 'dessert',
          name: 'Tiramisu',
          price: 120,
          description: 'Classic Italian dessert'
        }
      ],
      specialInstructions: {
        maxLength: 150,
        examples: "Al dente pasta, Extra cheese, No mushrooms"
      }
    },
    menu: [
      { name: "Spaghetti Carbonara", price: 180 },
      { name: "Margherita Pizza", price: 200 },
      { name: "Tiramisu", price: 120 }
    ]
  }
];

export const initializeVendors = async () => {
  try {
    // Check if vendors already exist
    const vendorsCollection = collection(db, 'vendors');
    const snapshot = await getDocs(vendorsCollection);
    
    if (snapshot.size > 0) {
      console.log('Vendors already exist in database');
      return { success: false, message: 'Vendors already exist' };
    }

    // Add all sample vendors
    const results = await Promise.all(
      sampleVendors.map(vendor => addDoc(vendorsCollection, vendor))
    );

    console.log(`${results.length} vendors added successfully!`);
    return { success: true, count: results.length };
  } catch (error) {
    console.error("Error adding vendors: ", error);
    return { success: false, error: error.message };
  }
};

// Optional: Reset vendors (use with caution)
export const resetVendors = async () => {
  // Note: Implementing this requires delete permissions in Firestore rules
  // and would need a proper batch delete implementation
  console.warn('Vendor reset not implemented - requires Firestore rules configuration');
};