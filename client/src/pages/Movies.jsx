import React from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'

const Movies = () => {

  const {shows} = useAppContext()

  return shows.length > 0 ? (
    <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden min-h-[80vh] my-40'>

      <BlurCircle top='150px' left='0px'/>
      <BlurCircle bottom='50px' right='50px'/>
      <div className='relative flex items-center pt-4 pb-10'>
        <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-24 mt-8 mb-20'>
        {shows.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center min-h-[80vh]'>
      <p className='text-gray-300 text-lg'>No movies available at the moment</p>
    </div>
  )
}

export default Movies
