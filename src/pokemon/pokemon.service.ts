import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if(error.code === 11000){
        throw new BadRequestException(`Pokemon exists in db ${createPokemonDto.name}`) 
      }
      console.log(error)
      throw new InternalServerErrorException(`Can't create Pokemon - Check Server Errors`)
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

 async findOne(id: string) {
    let pokemon:Pokemon
    if(!isNaN(+id)){
      pokemon = await this.pokemonModel.findOne({no:id})    }
    if(isValidObjectId(id)){
      pokemon = await this.pokemonModel.findById(id)
    }

    if(!pokemon) throw new NotFoundException("Pokemon with termin "+id+" doesn't exist!")
    return pokemon;
  }

  update(id: number, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }
}
