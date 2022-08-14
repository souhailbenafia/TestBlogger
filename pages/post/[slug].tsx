import { GetStaticProps } from 'next';
import React,{useState} from 'react'
import { sanityClient, urlFor } from '../../sanity';

import PortableText from 'react-portable-text'

import { Post } from '../../typings';
import Header from '../../components/Header';
import {useForm , SubmitHandler} from 'react-hook-form';

interface Props {
    post: Post;
}

interface FormData {
    _id: string;
    name: string;
    email: string;
    comment: string;
}
function Post( {post} :Props) {

    const { register, handleSubmit, formState: {errors} } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> =async data => {
           await fetch ("/api/createComment", {
            method: "POST",
            body: JSON.stringify(data)
            })
            .then(data => {
                console.log(data)
                setSubmited(true)
                }).catch(err => console.log(err))
                            
                        
    }

    const [submited , setSubmited] = useState(false);
    
  return (
    <main>
         <Header/>
        
        <img src={urlFor(post.mainImage).url()!} alt=" " className ="w-full h-40 object-cover"/> 

        <article className=" max-w-3xl mx-auto p-10">
            <h1 className='text-3xl mt-10 mb-3'>{post.title}</h1>
            <h2 className="text-xl font-light text-gray-500 mb-2"> {post.description}</h2>
            <div className=" items-center flex space-x-2 ">
            <img src={urlFor(post.author.image).url() } alt="" className=" h-10 w-10 rounded-full "/>
            <p className="font-extralight text-sm"> Blog post by <span className=" text-green-600">{post.author.name}</span> - Published at {" "} { new Date(post._createdAt).toLocaleString()}</p>

            </div>

            <div className='py-10'>
            <PortableText
             dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!} 
             projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID! }
             content={post.body}
             serializers={ 
                {
                    h1: ( { children }: any ) => (
                      <h1 className="text-2xl font-bold my-5">{ children }</h1>
                    ),
                    h2: ( { children }: any ) => (
                      <h2 className="text-xl font-bold my-5">{ children }</h2>
                    ),
                    li: ( { children }: any ) => (
                      <li className="ml-4 list-disc">{ children }</li>
                    ),
                    link: ({ href, children }: any ) => (
                      <a href={ href } className="text-blue-500 hover:underline">{ children }</a>
                    ),
                    p: ( { children }: any ) => (
                      <p className="ml-4 list-disc">{ children }</p>
                    ),
                  }
                
            
            }
             />
            </div>


        </article>

        <hr className='max-w-lg my-5 mx-auto border border-yellow-500 '/>

        {!submited ?
        <form  onSubmit={handleSubmit(onSubmit)} className="flex flex-col p-5 my-10  max-w-2xl mb-10 mx-auto">

<h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
  <h4 className="text-3xl font-bold">Leave a comment below!</h4> 
  <hr className="py-3 mt-2"/>
            
            <input {...register("_id",{required: true})} type="hidden" name="_id" value={post._id}  />
    <label htmlFor=""  className='block mb-5 '>
        <span className='text-gray-700 '> Name</span>
        <input  {...register("name",{required: true})} type="text" placeholder="Jhon Appleseed"className=" shadow rounded py-2 px-3 form-input mt-1 block w-full  focus:ring ring-yellow-500 outline-none " />
    </label>
    <label htmlFor="" className='block mb-5 ' >
        <span className='text-gray-700 '>Email</span>
        <input {...register("email",{required: true})} type="email" placeholder="Jhon Appleseed"className=" shadow rounded py-2 px-3 form-input mt-1 block  w-full  focus:ring ring-yellow-500  outline-none" />
    </label>
    <label htmlFor=""  className='block mb-5 '>
        <span className='text-gray-700 '> Comment</span>
        <textarea  {...register("comment",{required: true})} rows={8} placeholder="Jhon Appleseed"className=" shadow rounded py-2 px-3 form-textarea mt-1 block w-full focus:ring ring-yellow-500  outline-none " />
    </label>
<div>
{errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
{errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}

</div>

<input type="submit" className=' shadow bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:shadow-outline text-white font-bold py-2 rounded  cursor-pointer ' />
</form> 
:
<div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
<h3 className="text-3xl font-bold">
  Thank you for submitting your comment!
</h3>
<p>
 Once it has been approved, it will appear below!
</p>
</div>

}

<div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow-yellow-500 shadow space-y-2">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2"/>

        { post.comments?.map( ({ _id:id, name, comment }) => (
          <div key={ id }>
            <p>
              <span className="text-yellow-400">{ name }: </span>{ comment }
            </p>
          </div>
        ))}

      </div>


      

    </main>
  )
}

export default Post;

export const getStaticPaths = async() => {
    const query = `
    *[_type == 'post']{
      _id,
      slug {
        current
      }
    }`
  
    const posts = await sanityClient.fetch( query );
  
    const paths = posts.map( (post: Post) => ({
      params: {
        slug: post.slug.current
      }
    }))
  
    return {
      paths,
      fallback: 'blocking'
    }
  }

    export const getStaticProps: GetStaticProps = async ({ params}  ) => {
        const query = `
        *[_type == "post" && slug.current == $slug][0]
        {
            _id,
            _createdAt,
            title,
            slug,
            author -> {name,image},
            'comments': *[
                _type == "comment" && 
                post._ref == ^._id &&
                approved == true],
            description,
            mainImage,
            body,


        }
        `
        const post = await sanityClient.fetch(query, {slug: params?.slug});
        if (!post){
           return {
            notFound: true
        }
    }

        return {
            props: {
                post
            },
            revalidate: 60, //revalidate after 60 seconds
        }
        
    }
      
    