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
      this.handleExceptions(error)
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

 async findOne(id: string) {
    let pokemon:Pokemon
    if(!isNaN(+id)){
      pokemon = await this.pokemonModel.findOne({no:id})    
    }
    else if(isValidObjectId(id)){
      pokemon = await this.pokemonModel.findById(id)
    }
    else if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:id})    
    }
    if(!pokemon) throw new NotFoundException("Pokemon with termin "+id+" doesn't exist!")
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    try {
      const pokemon = await this.findOne(id)

    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()
    }
    const pokemonUpdated = await pokemon.updateOne(updatePokemonDto,{new:true})
    return {...pokemon.toJSON(),...updatePokemonDto}
    } catch (error) {
      this.handleExceptions(error)
    }
    
  }

  async  remove(id: string) {
     //const result  = await this.pokemonModel.findByIdAndDelete(id)

     const {deletedCount} = await this.pokemonModel.deleteOne({_id:id})
     if(deletedCount === 0){
      throw new BadRequestException("No existe ningun pokemon con el id "+id)
     }
     return deletedCount
  }


  private handleExceptions (error:any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`) 
    }
    console.log(error)
    throw new InternalServerErrorException(`Can't create Pokemon - Check Server Errors`)
  }
}
