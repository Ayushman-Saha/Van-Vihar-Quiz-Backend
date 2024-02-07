
# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.

# ENV MONGODB_PASS="chandlab"
# ENV MONGODB_USERNAME="admin"
# ENV MONGO_URI="mongodb://admin:chandlab@localhost:27017"

# ENV CORS_ORIGIN="*"

# ENV PORT=4000

# ENV SAMPLE_SIZE = 2

# ENV MARKS_EASY = 1
# ENV MARKS_MEDIUM = 2
# ENV MARKS_HARD = 5


# ENV CLOUDINARY_CLOUD_NAME="dstdv9fdn"
# ENV CLOUDINARY_API_KEY="671762784394687"
# ENV CLOUDINARY_API_SECRET="ZYDWSE-kMTQJmvPot0Q0175LqiA"

WORKDIR /usr/src/app


COPY . .
RUN npm install
# Expose the port that the application listens on.
EXPOSE 4000

# Run the application.
CMD npm run build
