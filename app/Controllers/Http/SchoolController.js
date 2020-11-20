'use strict'

const Database = use('Database')
const School = use('App/Models/School')
const Phone = use('App/Models/Phone')

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with schools
 */
class SchoolController {
  /**
   * Show a list of all schools.
   * GET schools
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    try {
      //const schools = await School.all()
      const schools = await Database
        .select('id','socialReason','latitudeSchool','longitudeSchool')
        .from('schools');
      return response.json(schools)
    } catch (e) {
      return response.badRequest('Ocorreu um erro inesperado.')
    }
  }

  /**
   * Create/save a new school.
   * POST schools
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const schoolData = request.only(["socialReason", "latitudeSchool", "longitudeSchool", "emailSchool", "addressSchool"])
    const phoneData = request.only(['numberPhone'])

    const trx = await Database.beginTransaction()
    try {
      const school = await School.create({ ...schoolData }, trx)
      const phone = await Phone.create({ ...phoneData, school_id: school.id }, trx)

      await trx.commit()

      return response.json({
        success: true,
        data: {
          school: {
            ...school.$attributes
          },
          phone: {
            ...phone.$attributes
          }
        },
        message: 'Cadastro criado com sucesso.'
      })
    } catch(e) {
      return response.badRequest('Ocorreu um erro ao registrar sua conta.')
    }
  }

  /**
   * Display a single school.
   * GET schools/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    const { id } = request.params;
    const school = await Database
      .select('id','socialReason','latitudeSchool',
              'longitudeSchool','emailSchool', 'addressSchool')
      .from('schools')
      .where('id','=',id)

    const phone = await Database
      .select('numberPhone')
      .from('phones')
      .where('school_id','=',id)

    // const school = await School.findByOrFail('id', params.id)
    // const phone = await Phone.findByOrFail('school_id', school.id)

    return response.json({
      id: school[0].id,
      socialReason: school[0].socialReason,
      latitudeSchool: school[0].latitudeSchool,
      longitudeSchool: school[0].longitudeSchool,
      emailSchool: school[0].emailSchool,
      addressSchool: school[0].addressSchool,
      numberPhone: phone[0].numberPhone
    })
      // ...school.$attributes,
      // phone
  }

  /**
   * Update school details.
   * PUT or PATCH schools/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const school = await School.findByOrFail('id', params.id)
    const schoolData = request.only(["socialReason", "latitudeSchool", "longitudeSchool", "emailSchool", "addressSchool"])
    const phone = await Phone.findByOrFail('school_id', school.id)
    const phoneData = request.only(['numberPhone'])

    const trx = await Database.beginTransaction()

    try {
      school.merge(schoolData)
      await school.save(trx)

      phone.merge(phoneData)
      await phone.save(trx)

      trx.commit()

      return response.json({
        ...school.$attributes,
        phone
      })
    } catch(e) {
      return response.badRequest('Aconteceu um erro ao atualizar os dados.')
    }
  }

  /**
   * Delete a school with id.
   * DELETE schools/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    const school = await School.findByOrFail('id', params.id)
    try {
      await school.delete()
      return response.json({
        message: 'Cadastro removido com sucesso.'
      })
    } catch (e) {
      return response.badRequest('Ocorreu um erro ao deletar o seu cadastro.')
    }
  }
}

module.exports = SchoolController
