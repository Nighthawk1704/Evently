import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const userSignupSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters').max(128),
  phone: z.string().max(20).optional().or(z.literal('')),
});

const vendorCategories = ['Catering', 'Florist', 'Decoration', 'Lighting'];

export const vendorSignupSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters').max(128),
  phone: z.string().max(20).optional().or(z.literal('')),
  businessName: z.string().min(2, 'Business name is required').max(120),
  category: z.enum(vendorCategories, { errorMap: () => ({ message: 'Pick a category' }) }),
  description: z.string().min(10, 'At least 10 characters').max(500),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required').max(150),
  description: z.string().min(10, 'At least 10 characters').max(1000),
  category: z.enum(vendorCategories, { errorMap: () => ({ message: 'Pick a category' }) }),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Must be >= 0'),
  unit: z.enum(['per_event', 'per_person', 'per_hour', 'per_day']),
  imageUrl: z.string().max(500).optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Invalid email'),
  address: z.string().min(5, 'Address is required').max(300),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pin code is required'),
  number: z.string().min(10, 'Mobile number is required').max(15),
  paymentMode: z.enum(['Cash', 'UPI'], { errorMap: () => ({ message: 'Pick a payment mode' }) }),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const requestItemSchema = z.object({
  vendor: z.string().min(1, 'Pick a vendor'),
  title: z.string().min(3, 'Title is required').max(150),
  details: z.string().min(10, 'At least 10 characters').max(1000),
  budget: z.string().optional().or(z.literal('')),
  eventDate: z.string().min(1, 'Event date is required'),
});
