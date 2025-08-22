# VFind 🔍

## Description

VFind is a web application that allows users to search for products using images. Upload an image to quickly find similar products online. The app also features a virtual try-on capability powered by Google's Gemini AI.

## Tech Stack 🌐

### Frontend

- Next.js, Tailwind CSS, shadcn/ui, Framer Motion

### Backend

- Python (FastAPI for backend), Pinecone (img to vector, vector search)
- MongoDB (for storing product data)
- PostHog (for web analytics)
- Google Gemini 2.0 Flash (for virtual try-on feature)

## Features

- **Visual Search**: Upload product images to find similar wearable items
- **Virtual Try-On**: Visualize how clothing items would look on a person using Google's Gemini AI model
- **User Authentication**: Personalized experience with user accounts
- **Responsive Design**: Works on all devices

## Demos

<div>
      <div>
      <a href="https://www.loom.com/share/f7173cbfa4784cb3ac08b5bad9c06149">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/f7173cbfa4784cb3ac08b5bad9c06149-006c82301d6ec30d-full-play.gif">
      <a href="https://www.loom.com/share/f7173cbfa4784cb3ac08b5bad9c06149">
      <p>VFind - Visual Search Engine</p>
      </div>
      <div>
      <a href="https://www.loom.com/share/1d09348a5bb44020917c3154b995bc65">
      <img style="max-width:300px;" src="https://cdn.loom.com/sessions/thumbnails/1d09348a5bb44020917c3154b995bc65-27fe078bf6750aa8-full-play.gif" href="https://www.loom.com/share/1d09348a5bb44020917c3154b995bc65">
      <a href="https://www.loom.com/share/1d09348a5bb44020917c3154b995bc65">
      <p>VFind - VTon via Gemini 2.0</p>
      </a>
      </div>
  </div>

## ToDo

- [x] add signup and login functionality
- [x] backend API isnt secure, API endpoint can be retreived via dev tools (anyone could use API directly), api route must be implemented
- [x] implement virtual try-on feature using Google Gemini 2.0 Flash
- [ ] 10 similar results or something like that (if user is signedup)
- [ ] full body fit recommendation (if user is signedup)
- [ ] improve virtual try-on accuracy and performance
- [ ] browser extention (if user is signedup)(only top 3 similarsearch result)
