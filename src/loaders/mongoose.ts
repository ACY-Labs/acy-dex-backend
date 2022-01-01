import mongoose from "mongoose";

export default async (props: {
  databaseURI: string,
  databaseName: string,
  databaseUser: string,
  databasePass: string
}): Promise<mongoose.Connection> => {
  const connection = await mongoose.createConnection(props.databaseURI, {
    dbName: props.databaseName,
    user: props.databaseUser,
    pass: props.databasePass,
    
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
  return connection;
};
