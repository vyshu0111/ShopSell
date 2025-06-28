import express from 'express'
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import {Admin, Cart, Orders, Product, User } from './Schema.js'

const app = express();

app.use(express.json());
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

const PORT = 6001;

mongoose.connect('mongodb://localhost:27017/shopEZ',{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('MongoDB connected successfully');

    app.post('/register', async (req, res) => {
        const { username, email, usertype, password } = req.body;
        try {
            // Validate required fields
            if (!username || !email || !usertype || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username, email, usertype, password: hashedPassword
            });
            const userCreated = await newUser.save();
            return res.status(201).json(userCreated);

        } catch (error) {
            console.error('Register error:', error);
            return res.status(500).json({ message: 'Server Error', error: error.message });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const user = await User.findOne({ email });
    
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            } else{
                return res.json(user);
            }
          
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Server Error', error: error.message });
        }
    });

    // fetch banner
    app.get('/fetch-banner', async(req, res)=>{
        try{
            const admin = await Admin.findOne();
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            res.json(admin.banner);

        }catch(err){
            console.error('Fetch banner error:', err);
            res.status(500).json({ message: 'Error occurred', error: err.message });
        }
    })

    // fetch users
    app.get('/fetch-users', async(req, res)=>{
        try{
            const users = await User.find();
            res.json(users);

        }catch(err){
            console.error('Fetch users error:', err);
            res.status(500).json({ message: 'Error occurred', error: err.message });
        }
    })

    // Fetch individual product
    app.get('/fetch-product-details/:id', async(req, res)=>{
        const id = req.params.id;
        try{
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid product ID format' });
            }

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        }catch(err){
            console.error('Fetch product details error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // fetch products
    app.get('/fetch-products', async(req, res)=>{
        try{
            const products = await Product.find();
            res.json(products);

        }catch(err){
            console.error('Fetch products error:', err);
            res.status(500).json({ message: 'Error occurred', error: err.message });
        }
    })

    // fetch orders
    app.get('/fetch-orders', async(req, res)=>{
        try{
            const orders = await Orders.find();
            res.json(orders);

        }catch(err){
            console.error('Fetch orders error:', err);
            res.status(500).json({ message: 'Error occurred', error: err.message });
        }
    })

    // Fetch categories
    app.get('/fetch-categories', async(req, res)=>{
        try{
            const data = await Admin.find();
            if(data.length===0){
                const newData = new Admin({banner: "", categories: []})
                await newData.save();
                return res.json(newData.categories);
            }else{
                return res.json(data[0].categories);
            }
        }catch(err){
            console.error('Fetch categories error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // Add new product
    app.post('/add-new-product', async(req, res)=>{
        const {productName, productDescription, productMainImg, productCarousel, productSizes, productGender, productCategory, productNewCategory, productPrice, productDiscount} = req.body;
        try{
            // Validate required fields
            if (!productName || !productDescription || !productPrice) {
                return res.status(400).json({ message: 'Product name, description, and price are required' });
            }

            if(productCategory === 'new category'){
                if (!productNewCategory) {
                    return res.status(400).json({ message: 'New category name is required' });
                }
                
                let admin = await Admin.findOne();
                if (!admin) {
                    admin = new Admin({banner: "", categories: [productNewCategory]});
                } else {
                    admin.categories.push(productNewCategory);
                }
                await admin.save();
                
                const newProduct = new Product({
                    title: productName, 
                    description: productDescription, 
                    mainImg: productMainImg, 
                    carousel: productCarousel, 
                    category: productNewCategory,
                    sizes: productSizes, 
                    gender: productGender, 
                    price: productPrice, 
                    discount: productDiscount
                });
                await newProduct.save();
            } else{
                const newProduct = new Product({
                    title: productName, 
                    description: productDescription, 
                    mainImg: productMainImg, 
                    carousel: productCarousel, 
                    category: productCategory,
                    sizes: productSizes, 
                    gender: productGender, 
                    price: productPrice, 
                    discount: productDiscount
                });
                await newProduct.save();
            }
            res.json({message: "Product added successfully!"});
        }catch(err){
            console.error('Add product error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // update product
    app.put('/update-product/:id', async(req, res)=>{
        const {productName, productDescription, productMainImg, productCarousel, productSizes, productGender, productCategory, productNewCategory, productPrice, productDiscount} = req.body;
        try{
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid product ID format' });
            }

            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if(productCategory === 'new category'){
                if (!productNewCategory) {
                    return res.status(400).json({ message: 'New category name is required' });
                }

                let admin = await Admin.findOne();
                if (!admin) {
                    admin = new Admin({banner: "", categories: [productNewCategory]});
                } else {
                    admin.categories.push(productNewCategory);
                }
                await admin.save();

                product.title = productName;
                product.description = productDescription;
                product.mainImg = productMainImg;
                product.carousel = productCarousel;
                product.category = productNewCategory;
                product.sizes = productSizes;
                product.gender = productGender;
                product.price = productPrice;
                product.discount = productDiscount;

                await product.save();
               
            } else{
                product.title = productName;
                product.description = productDescription;
                product.mainImg = productMainImg;
                product.carousel = productCarousel;
                product.category = productCategory;
                product.sizes = productSizes;
                product.gender = productGender;
                product.price = productPrice;
                product.discount = productDiscount;

                await product.save();
            }
            res.json({message: "Product updated successfully!"});
        }catch(err){
            console.error('Update product error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // Update banner
    app.post('/update-banner', async(req, res)=>{
        const {banner} = req.body;
        try{
            if (banner === undefined) {
                return res.status(400).json({ message: 'Banner data is required' });
            }

            const data = await Admin.find();
            if(data.length===0){
                const newData = new Admin({banner: banner, categories: []})
                await newData.save();
                res.json({message: "Banner updated successfully"});
            }else{
                const admin = await Admin.findOne();
                admin.banner = banner;
                await admin.save();
                res.json({message: "Banner updated successfully"});
            }
            
        }catch(err){
            console.error('Update banner error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // buy product
    app.post('/buy-product', async(req, res)=>{
        const {userId, name, email, mobile, address, pincode, title, description, mainImg, size, quantity, price, discount, paymentMethod, orderDate} = req.body;
        try{
            // Validate required fields
            if (!userId || !name || !email || !mobile || !address || !title || !quantity || !price || !paymentMethod) {
                return res.status(400).json({ message: 'Required fields are missing' });
            }

            const newOrder = new Orders({
                userId, name, email, mobile, address, pincode, 
                title, description, mainImg, size, quantity, 
                price, discount, paymentMethod, orderDate
            });
            await newOrder.save();
            res.json({message: 'Order placed successfully'});

        }catch(err){
            console.error('Buy product error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // cancel order
    app.put('/cancel-order', async(req, res)=>{
        const {id} = req.body;
        try{
            if (!id) {
                return res.status(400).json({ message: 'Order ID is required' });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid order ID format' });
            }

            const order = await Orders.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.orderStatus = 'cancelled';
            await order.save();
            res.json({message: 'Order cancelled successfully'});

        }catch(err){
            console.error('Cancel order error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // update order status
    app.put('/update-order-status', async(req, res)=>{
        const {id, updateStatus} = req.body;
        try{
            if (!id || !updateStatus) {
                return res.status(400).json({ message: 'Order ID and status are required' });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid order ID format' });
            }

            const order = await Orders.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.orderStatus = updateStatus;
            await order.save();
            res.json({message: 'Order status updated successfully'});

        }catch(err){
            console.error('Update order status error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // fetch cart items
    app.get('/fetch-cart', async(req, res)=>{
        try{
            const items = await Cart.find();
            res.json(items);

        }catch(err){
            console.error('Fetch cart error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // add cart item
    app.post('/add-to-cart', async(req, res)=>{
        const {userId, title, description, mainImg, size, quantity, price, discount} = req.body
        try{
            // Validate required fields
            if (!userId || !title || !quantity || !price) {
                return res.status(400).json({ message: 'Required fields are missing' });
            }

            const item = new Cart({userId, title, description, mainImg, size, quantity, price, discount});
            await item.save();

            res.json({message: 'Added to cart successfully'});
            
        }catch(err){
            console.error('Add to cart error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // increase cart quantity
    app.put('/increase-cart-quantity', async(req, res)=>{
        const {id} = req.body;
        try{
            if (!id) {
                return res.status(400).json({ message: 'Cart item ID is required' });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid cart item ID format' });
            }

            const item = await Cart.findById(id);
            if (!item) {
                return res.status(404).json({ message: 'Cart item not found' });
            }

            item.quantity = parseInt(item.quantity) + 1;
            await item.save();

            res.json({message: 'Quantity increased successfully'});
        }catch(err){
            console.error('Increase cart quantity error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // decrease cart quantity
    app.put('/decrease-cart-quantity', async(req, res)=>{
        const {id} = req.body;
        try{
            if (!id) {
                return res.status(400).json({ message: 'Cart item ID is required' });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid cart item ID format' });
            }

            const item = await Cart.findById(id);
            if (!item) {
                return res.status(404).json({ message: 'Cart item not found' });
            }

            const newQuantity = parseInt(item.quantity) - 1;
            if (newQuantity <= 0) {
                await Cart.deleteOne({_id: id});
                return res.json({message: 'Item removed from cart'});
            }

            item.quantity = newQuantity;
            await item.save();

            res.json({message: 'Quantity decreased successfully'});
        }catch(err){
            console.error('Decrease cart quantity error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    // remove from cart
    app.delete('/remove-item/:id', async(req, res)=>{
        const {id} = req.params;
        try{
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid cart item ID format' });
            }

            const result = await Cart.deleteOne({_id: id});
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Cart item not found' });
            }

            res.json({message: 'Item removed successfully'});
        }catch(err){
            console.error('Remove item error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    });

    // Order from cart
    app.post('/place-cart-order', async(req, res)=>{
        const {userId, name, mobile, email, address, pincode, paymentMethod, orderDate} = req.body;
        try{
            // Validate required fields
            if (!userId || !name || !mobile || !email || !address || !paymentMethod) {
                return res.status(400).json({ message: 'Required fields are missing' });
            }

            const cartItems = await Cart.find({userId});
            if (cartItems.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // Use Promise.all for better error handling
            await Promise.all(cartItems.map(async (item) => {
                const newOrder = new Orders({
                    userId, name, email, mobile, address, pincode, 
                    title: item.title, description: item.description, 
                    mainImg: item.mainImg, size: item.size, 
                    quantity: item.quantity, price: item.price, 
                    discount: item.discount, paymentMethod, orderDate
                });
                await newOrder.save();
                await Cart.deleteOne({_id: item._id});
            }));

            res.json({message: 'Orders placed successfully'});

        }catch(err){
            console.error('Place cart order error:', err);
            res.status(500).json({message: "Error occurred", error: err.message});
        }
    })

    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
    })

}).catch((e)=> {
    console.error(`Error in database connection: ${e}`);
    process.exit(1);
});