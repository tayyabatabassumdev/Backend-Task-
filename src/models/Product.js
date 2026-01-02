import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true 

  },
  price: { 
    type: Number,
    default: 0 

  },
  stock: { 
    type: Number,
    default: 0 

  },
  image: { 
    type: String,
    default: null 

  }
});

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    default: ''
  },
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number,
    default: 0 
  },
  image: { 
    type: String,
    default: null 
    
  },

  variants: [variantSchema],
 

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Product', productSchema);