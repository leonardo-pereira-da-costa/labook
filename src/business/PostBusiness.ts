import { PostDatabase } from '../database/PostDatabase'
import { CreatePostInputDTO, CreatePostOutputDTO } from '../dtos/post/createPost.dto'
import { DeletePostInputDTO, DeletePostOutputDTO } from '../dtos/post/deletePost.dto'
import { EditPostInputDTO, EditPostOutputDTO } from '../dtos/post/editPost.dto'
import { GetPostInputDTO, GetPostOutputDTO } from '../dtos/post/getPost.dto'
import { LikeOrDislikePostInputDTO, LikeOrDislikePostOutputDTO } from '../dtos/post/likeOrDislikePost.dto'
import { ForbiddenError } from '../errors/ForbiddenError'
import { NotFoundError } from '../errors/NotFoundError'
import { UnauthorizedError } from '../errors/UnauthorizedError'
import { LikeDislikeDB, POST_LIKE, Posts } from '../models/Posts'
import { USER_ROLES } from '../models/Users'
import { IdGenerator } from '../services/IdGenerator'
import { TokenManager } from '../services/TokenManager'

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    public createPosts = async (
        input: CreatePostInputDTO): Promise<CreatePostOutputDTO> => {
        const { content, token } = input
        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }
        const id = this.idGenerator.generate()
        const post = new Posts(
            id,
            content,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString(),
            payload.id,
            payload.name
        )
        const postDB = post.toDBModel()
        await this.postDatabase.insertPost(postDB)
        const output: CreatePostOutputDTO = undefined
        return output
    }

    public getPost = async (
        input: GetPostInputDTO): Promise<GetPostOutputDTO> => {
        const { token } = input
        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }
        const postsDBWithCreatorName = await this.postDatabase.getPostsWithCreatorName()
        const postsModel = postsDBWithCreatorName.map((postWithCreatorName) => {
            const post = new Posts(
                postWithCreatorName.id,
                postWithCreatorName.content,
                postWithCreatorName.likes,
                postWithCreatorName.dislikes,
                postWithCreatorName.created_at,
                postWithCreatorName.updated_at,
                postWithCreatorName.creator_id,
                postWithCreatorName.creator_name
            )
            return post.toBusinessModel()
        })
        const output: GetPostOutputDTO = postsModel
        return output
    }

    public editPost = async (
        input: EditPostInputDTO): Promise<EditPostOutputDTO> => {
        const { content, token, idToEdit } = input
        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }
        const postDB = await this.postDatabase.findPostById(idToEdit)
        if (!postDB) {
            throw new NotFoundError("Id não existe")
        }
        if (payload.id !== postDB.creator_id) {
            throw new ForbiddenError("Só o criador pode editar e/ou remover")
        }
        const post = new Posts(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at,
            postDB.creator_id,
            payload.name
        )
        post.setCreatorName(content)
        const updatedPostDB = post.toDBModel()
        await this.postDatabase.updatePost(updatedPostDB)
        const output: EditPostOutputDTO = undefined
        return output
    }

    public deletePost = async (
        input: DeletePostInputDTO): Promise<DeletePostOutputDTO> => {
        const { token, idToDelete } = input
        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }
        const postDB = await this.postDatabase.findPostById(idToDelete)
        if (!postDB) {
            throw new NotFoundError("Id não existe")
        }
        if (payload.role !== USER_ROLES.ADMIN) {
            if (payload.id !== postDB.creator_id) {
                throw new ForbiddenError("Só o criador pode editar e/ou remover")
            }
        }
        if (payload.id !== postDB.creator_id) {
            throw new ForbiddenError("Só o criador pode editar e/ou remover")
        }
        await this.postDatabase.deletePostById(idToDelete)
        const output: DeletePostOutputDTO = undefined
        return output
    }

    public likeOrDislikePost = async (
        input: LikeOrDislikePostInputDTO): Promise<LikeOrDislikePostOutputDTO> => {
        const { token, like, postId } = input
        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }
        const postDBWithCreatorName = await this.postDatabase.findPostWithCreatorById(postId)
        if (!postDBWithCreatorName) {
            throw new NotFoundError("Id não existe")
        }
        const post = new Posts(
            postDBWithCreatorName.id,
            postDBWithCreatorName.content,
            postDBWithCreatorName.likes,
            postDBWithCreatorName.dislikes,
            postDBWithCreatorName.created_at,
            postDBWithCreatorName.updated_at,
            postDBWithCreatorName.creator_id,
            postDBWithCreatorName.creator_name
        )
        const likeSQLite = like ? 1 : 0
        const likeDislikeDB: LikeDislikeDB = {
            user_id: payload.id,
            post_id: postId,
            like: likeSQLite
        }
        const likeDislikeExists = await this.postDatabase.findLikeDislike(likeDislikeDB)
        if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeLike()
            } else {
                await this.postDatabase.updateLikeDislike(likeDislikeDB)
                post.removeLike()
                post.addDislike()
            }
        } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
            if (like === false) {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeDislike()
            } else {
                await this.postDatabase.updateLikeDislike(likeDislikeDB)
                post.removeDislike()
                post.addLike()
            }
        } else {
            await this.postDatabase.insertLikeDislike(likeDislikeDB)
            like ? post.addLike() : post.addDislike()
        }
        const updatedPostDB = post.toDBModel()
        await this.postDatabase.updatePost(updatedPostDB)
        const output: LikeOrDislikePostOutputDTO = undefined
        return output
    }
}