import { UserDatabase } from '../database/UserDatabase'
import { LoginInputDTO, LoginOutputDTO } from '../dtos/user/login.dto'
import { SignupInputDTO, SignupOutputDTO } from '../dtos/user/signup.dto'
import { BadRequestError } from '../errors/BadRequestError'
import { NotFoundError } from '../errors/NotFoundError'
import { TokenPayload, USER_ROLES, Users } from '../models/Users'
import { HashManager } from '../services/HashManager'
import { IdGenerator } from '../services/IdGenerator'
import { TokenManager } from '../services/TokenManager'

export class UserBusiness {
    constructor(
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) { }

    public signup = async (
        input: SignupInputDTO): Promise<SignupOutputDTO> => {
        const { name, email, password } = input
        const id = this.idGenerator.generate()
        const hashedPassword = await this.hashManager.hash(password)
        const user = new Users(
            id,
            name,
            email,
            hashedPassword,
            USER_ROLES.NORMAL,
            new Date().toISOString()
        )
        const userDB = user.toDBModel()
        await this.userDatabase.insertUser(userDB)
        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }
        const token = this.tokenManager.createToken(payload)
        const output: SignupOutputDTO = {
            token: token
        }
        return output
    }

    public login = async (
        input: LoginInputDTO): Promise<LoginOutputDTO> => {
        const { email, password } = input
        const userDB = await this.userDatabase.findUserByEmail(email)
        if (!userDB) {
            throw new NotFoundError("E-mail não é cadastrado")
        }
        const user = new Users(
            userDB.id,
            userDB.name,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at
        )
        const hashedPassword = user.getPassword()
        const isPasswordCorrect = await this.hashManager.compare(password, hashedPassword)
        if (!isPasswordCorrect) {
            throw new BadRequestError("E-mail e/ou senha incorreto(s)")
        }
        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }
        const token = this.tokenManager.createToken(payload)
        const output: LoginOutputDTO = {
            token: token
        }
        return output
    }
}