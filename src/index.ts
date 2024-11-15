import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Post } from './entity/Post';

const app = express();
app.use(express.json());

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "test_db",
  entities: [User,Post],
  synchronize: true,
});

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initializeDatabase = async () => {
  await wait(20000);
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    process.exit(1);
  }
};

initializeDatabase();

app.post('/users', async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "First name, last name, and email are required" });
  }
  
  try {
    const userRepository = AppDataSource.getRepository(User);
    const newUser = userRepository.create({ firstName, lastName, email });
    const savedUser = await userRepository.save(newUser);

    return res.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "An error occurred while creating user" });
  }
});

app.post('/posts', async (req, res) => {
  const { title, description, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ error: "title, description, and user ID are required" });
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) return res.status(404).json({ error: "User not found" });

    const postRepository = AppDataSource.getRepository(Post);
    const newPost = postRepository.create({ title, description, user });
    const savedPost = await postRepository.save(newPost);
    return res.status(201).json(savedPost);

  } catch(error) {
    console.log(error);
    return res.status(500).json({ error: "An error occurred while creating the post" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
