import PIL.Image
import PIL.ImageSequence
import PIL.ImageFont
import PIL.ImageDraw
import math
import sys

def create_enemy_health_bar(name, is_male, level, current_hp, total_hp, user_id, enemyStatus):

    enemy_health_bar = None

    if math.ceil((int(current_hp)/int(total_hp))*100) < 5:
        enemy_health_bar = PIL.Image.open('./media/battle_images/enemy_health_bar_0.png')
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 4 and math.ceil((int(current_hp)/int(total_hp))*100) < 10:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_5.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 9 and math.ceil((int(current_hp)/int(total_hp))*100) < 15:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_10.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 14 and math.ceil((int(current_hp)/int(total_hp))*100) < 20:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_15.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 19 and math.ceil((int(current_hp)/int(total_hp))*100) < 25:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_20.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 24 and math.ceil((int(current_hp)/int(total_hp))*100) < 30:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_25.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 29 and math.ceil((int(current_hp)/int(total_hp))*100) < 35:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_30.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 34 and math.ceil((int(current_hp)/int(total_hp))*100) < 40:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_35.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 39 and math.ceil((int(current_hp)/int(total_hp))*100) < 45:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_40.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 44 and math.ceil((int(current_hp)/int(total_hp))*100) < 50:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_45.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 49 and math.ceil((int(current_hp)/int(total_hp))*100) < 55:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_50.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 54 and math.ceil((int(current_hp)/int(total_hp))*100) < 60:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_55.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 59 and math.ceil((int(current_hp)/int(total_hp))*100) < 65:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_60.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 64 and math.ceil((int(current_hp)/int(total_hp))*100) < 70:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_65.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 69 and math.ceil((int(current_hp)/int(total_hp))*100) < 75:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_70.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 74 and math.ceil((int(current_hp)/int(total_hp))*100) < 80:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_75.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 79 and math.ceil((int(current_hp)/int(total_hp))*100) < 85:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_80.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 84 and math.ceil((int(current_hp)/int(total_hp))*100) < 90:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_85.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 89 and math.ceil((int(current_hp)/int(total_hp))*100) < 95:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_90.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 94 and math.ceil((int(current_hp)/int(total_hp))*100) < 100:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_95.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 99:
        enemy_health_bar = PIL.Image.open("./media/battle_images/enemy_health_bar_100.png")

    draw = PIL.ImageDraw.Draw(enemy_health_bar)
    font = PIL.ImageFont.truetype("./fonts/pokemon_font.ttf", 14)
    draw.text((2, 8), name, (0,0,0), font=font)
    draw.text((103, 8), "Lv %s"%(level), (0,0,0), font=font)
    
    enemy_health_bar.save('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))

    if is_male == "true":
        male = PIL.Image.open("./media/battle_images/male.png")

        background = PIL.Image.open('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))

        background.paste(male, (90, 5), male.convert('RGBA'))

        background.save('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))
    else:
        female = PIL.Image.open("./media/battle_images/female.png")

        background = PIL.Image.open('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))

        background.paste(female, (90, 5), female.convert('RGBA'))

        background.save('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))

    # frostbite
    if enemyStatus == "badly poisoned":
        background = PIL.Image.open('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))
        status = PIL.Image.open("./media/battle_images/poisoned.png")
        background.paste(status, (0, 20), status.convert('RGBA'))
        background.save('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))
    elif enemyStatus != "normal":
        background = PIL.Image.open('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))
        status = PIL.Image.open(f"./media/battle_images/{enemyStatus}.png")
        background.paste(status, (0, 20), status.convert('RGBA'))
        background.save('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))


    background_image = PIL.Image.open("./media/battle_images/grassy_field.png")
    health_bar = PIL.Image.open('./python/battle_image_outputs/enemy_health_bars/%s_enemy_health_bar.png'%(user_id))
    background_image.paste(health_bar, (0, 20), health_bar.convert('RGBA'))
    background_image.save('./python/battle_image_outputs/enemy_health_bar_backgrounds/%s_enemy_health_bar_background.png'%(user_id))
    
def create_team_health_bar(name, is_male, level, current_hp, total_hp, user_id, userStatus):
    team_health_bar = None

    if math.ceil((int(current_hp)/int(total_hp))*100) < 5:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_0.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 4 and math.ceil((int(current_hp)/int(total_hp))*100) < 10:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_5.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 9 and math.ceil((int(current_hp)/int(total_hp))*100) < 15:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_10.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 14 and math.ceil((int(current_hp)/int(total_hp))*100) < 20:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_15.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 19 and math.ceil((int(current_hp)/int(total_hp))*100) < 25:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_20.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 24 and math.ceil((int(current_hp)/int(total_hp))*100) < 30:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_25.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 29 and math.ceil((int(current_hp)/int(total_hp))*100) < 35:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_30.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 34 and math.ceil((int(current_hp)/int(total_hp))*100) < 40:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_35.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 39 and math.ceil((int(current_hp)/int(total_hp))*100) < 45:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_40.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 44 and math.ceil((int(current_hp)/int(total_hp))*100) < 50:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_45.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 49 and math.ceil((int(current_hp)/int(total_hp))*100) < 55:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_50.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 54 and math.ceil((int(current_hp)/int(total_hp))*100) < 60:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_55.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 59 and math.ceil((int(current_hp)/int(total_hp))*100) < 65:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_60.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 64 and math.ceil((int(current_hp)/int(total_hp))*100) < 70:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_65.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 69 and math.ceil((int(current_hp)/int(total_hp))*100) < 75:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_70.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 74 and math.ceil((int(current_hp)/int(total_hp))*100) < 80:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_75.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 79 and math.ceil((int(current_hp)/int(total_hp))*100) < 85:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_80.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 84 and math.ceil((int(current_hp)/int(total_hp))*100) < 90:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_85.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 89 and math.ceil((int(current_hp)/int(total_hp))*100) < 95:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_90.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 94 and math.ceil((int(current_hp)/int(total_hp))*100) < 100:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_95.png")
    elif math.ceil((int(current_hp)/int(total_hp))*100) > 99:
        team_health_bar = PIL.Image.open("./media/battle_images/team_health_bar_100.png")

    draw = PIL.ImageDraw.Draw(team_health_bar)
    font = PIL.ImageFont.truetype("./fonts/pokemon_font.ttf", 14)
    draw.text((20, 8), name, (0,0,0), font=font)
    draw.text((120, 8), "Lv %s"%(level), (0,0,0), font=font)
    draw.text((105, 31), "%s/%s"%(current_hp,total_hp), (0,0,0), font=font)

    team_health_bar.save('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))

    if is_male == "true":
        male = PIL.Image.open("./media/battle_images/male.png")

        background = PIL.Image.open('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))

        background.paste(male, (105, 5), male.convert('RGBA'))
        background.save('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))

    else:
        female = PIL.Image.open("./media/battle_images/female.png")

        background = PIL.Image.open('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))

        background.paste(female, (105, 5), female.convert('RGBA'))
        background.save('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))

    # frostbite
    if userStatus == "badly poisoned":
        background = PIL.Image.open('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))
        status = PIL.Image.open("./media/battle_images/poisoned.png")
        background.paste(status, (0, 20), status.convert('RGBA'))
        background.save('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))
    elif userStatus != "normal":
        background = PIL.Image.open('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))
        status = PIL.Image.open(f"./media/battle_images/{userStatus}.png")
        background.paste(status, (17, 28), status.convert('RGBA'))
        background.save('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))


    background_image = PIL.Image.open('./python/battle_image_outputs/enemy_health_bar_backgrounds/%s_enemy_health_bar_background.png'%(user_id))
    health_bar = PIL.Image.open('./python/battle_image_outputs/team_health_bars/%s_team_health_bar.png'%(user_id))
    background_image.paste(health_bar, (227, 150), health_bar.convert('RGBA'))
    background_image.save('./python/battle_image_outputs/battle_png/%s_battle.png'%(user_id))

def create_frames(user_id, enemy_poke_id, team_poke_id, enemy_pokemon_shiny, team_pokemon_shiny):

    enemyPokemon = enemyPokemon = PIL.Image.open("./media/pokemon/normal-gif/front/%s.gif"%(enemy_poke_id))
    if enemy_pokemon_shiny == "true":
        enemyPokemon = PIL.Image.open("./media/pokemon/shiny-gif/front/%s.gif"%(enemy_poke_id))

    teamPokemon = teamPokemon = PIL.Image.open("./media/pokemon/normal-gif/back/%s.gif"%(team_poke_id))
    if team_pokemon_shiny == "true":
        teamPokemon = PIL.Image.open("./media/pokemon/shiny-gif/back/%s.gif"%(team_poke_id))

    background_image = PIL.Image.open('./python/battle_image_outputs/battle_png/%s_battle.png'%(user_id))

    image_roles = {
        'enemyPokemon': enemyPokemon,
        'teamPokemon': teamPokemon,
        'background': background_image.convert(mode='RGBA')
    }

    seek_range = image_roles['teamPokemon'].n_frames
    if (image_roles['teamPokemon'].n_frames > image_roles['enemyPokemon'].n_frames):
        seek_range = image_roles['enemyPokemon'].n_frames

    for x in range(0, seek_range):
        image_roles['enemyPokemon'].seek(x)
        image_roles['teamPokemon'].seek(x)

        current_background = image_roles['background'].copy()

        current_foreground = image_roles['enemyPokemon'].convert(mode='RGBA').resize((75, 75))
        current_background.alpha_composite(current_foreground, dest=(230,45))

        current_foreground = image_roles['teamPokemon'].convert(mode='RGBA').resize((100, 100))
        current_background.alpha_composite(current_foreground, dest=(50,105))

        yield current_background


# enemy_pokemon_name, enemy_pokemon_gender, enemy_pokemon_level, enemy_pokemon_current_hp, enemy_pokemon_total_hp, user_id,
#     user_pokemon_name, user_pokemon_gender, user_pokemon_level, user_pokemon_current_hp, user_pokemon_total_hp,
#         enemy_pokemon_id, user_pokemon_id

create_enemy_health_bar(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], sys.argv[16])

create_team_health_bar(sys.argv[7], sys.argv[8], sys.argv[9], sys.argv[10], sys.argv[11], sys.argv[6], sys.argv[17])

frames = tuple(create_frames(sys.argv[6], sys.argv[12], sys.argv[13], sys.argv[14], sys.argv[15]))

frames[0].save(
    './python/battle_image_outputs/battle_gifs/%s.gif'%(sys.argv[6]),
    save_all=True,
    append_images=frames[1:],
    duration=100,loop=0
)



