//powered by Tollainmear
//This work is licensed under  Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

//Plugin Config below
//是否忽略对自己的@,建议开启，有时候会出现bug
let ignoreSelf = true

function RegistAtSound(name, type, speed) {
    let atSound = { soundName: name, soundType: type, soundSpeed: speed }
    return atSound
}

//注册音效类型
let soundList = [
    RegistAtSound("钟声", 'minecraft:block.bell.use', 1.0),
    RegistAtSound("升级", 'minecraft:entity.player.levelup', 1.0),
    RegistAtSound("经验球", 'minecraft:entity.experience_orb.pickup', 0.1),
    RegistAtSound("铁砧", 'minecraft:block.anvil.land', 1.0),
    RegistAtSound("村民", 'minecraft:entity.villager.ambient', 1.0),
]

//监听聊天事件，用于分析可触发@功能的关键字
onEvent('player.chat', e => {
    let msg = e.message
    let arr = msg.split(' ')
    arr.forEach(ele => {
        // if (ele == 'a') return
        if (ele.length() > 16) return
        let player = e.server.getPlayer(ele)
        if(ignoreSelf){
            if (player.toString() == e.player.toString()) return
        }
        if (player != null) {
            player.tell('[' + e.player.toString() + '@了你]')
            tellRaw(player, '["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"' + player.toString() + '@了你","color":"yellow"}]')
            PlayAtSoundToPlayer(player)
        }
    })
})

//注册指令 /at <help/info/soundList/setSound>
onEvent("command.registry", event => {
    const { commands: Commands, arguments: Arguments } = event;

    event.register(
        Commands.literal('at')
            .then(Commands.literal('setSound')
                .then(Commands.argument('soundIndex', Arguments.INTEGER.create(event))
                    .executes(ctx => {
                        // const modifyType = Arguments.STRING.getResult(ctx, 'modifyType')
                        const soundIndex = Arguments.INTEGER.getResult(ctx, 'soundIndex')

                        let playerRaw = ctx.source.playerOrException
                        if (playerRaw == null) {
                            console.info("你不能在服务器端执行此指令")
                            return 0
                        }
                        let player = playerRaw.asKJS()

                        let soundInfo = soundList[soundIndex]

                        if (soundInfo != null) {
                            tellRaw(player, '["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"已经将@的音效设置为","color":"white"},{"text":"[' + soundInfo.soundName + ']","color":"green"}]')
                            player.persistentData.atSound = soundInfo.soundType
                            player.persistentData.atSpeed = soundInfo.soundSpeed
                            PlayAtSoundToPlayer(player)
                            return 1
                        } else {
                            Utils.server.runCommandSilent('playsound minecraft:block.anvil.land music ' + player.toString() + ' ~ ~ ~ 100 1 1')
                            tellRaw(player, '["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"您输入的索引无效！","color":"red"}]')
                            TellSoundList(player, "red")
                            return 1
                        }
                    })
                )
            )

            .then(Commands.literal('help')
                .executes(ctx => {
                    let playerRaw = ctx.source.playerOrException
                    if (playerRaw == null) {
                        console.info("你不能在服务器端执行此指令")
                        return 0
                    }
                    let player = playerRaw.asKJS()
                    tellRaw(player, ' ["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"/at info","color":"yellow"},{"text":"  -  ","color":"white"},{"text":"查看你当前的@音效","color":"green"}]')
                    tellRaw(player, ' ["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"/at soundList","color":"yellow"},{"text":"  -  ","color":"white"},{"text":"查看可用音效列表","color":"green"}]')
                    tellRaw(player, ' ["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"/at setSound [数字]","color":"yellow"},{"text":"  -  ","color":"white"},{"text":"定制你的@音效","color":"green"}]')
                    //版权所有，请在修改时保留下列字段
                    tellRaw(player, '["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"由米二(Tollainmear)开发","color":"gray"}]')
                    return 1
                }
                )
            )


            .then(Commands.literal('soundList')
                .executes(ctx => {
                    let playerRaw = ctx.source.playerOrException
                    if (playerRaw == null) {
                        console.info("你不能在服务器端执行此指令")
                        return 0
                    }
                    let player = playerRaw.asKJS()
                    TellSoundList(player, "green")
                    return 1
                }
                )
            )

            .then(Commands.literal('info')
                .executes(ctx => {
                    let playerRaw = ctx.source.playerOrException
                    if (playerRaw == null) {
                        console.info("你不能在服务器端执行此指令")
                        return 0
                    }
                    let player = playerRaw.asKJS()
                    tellRaw(player, '["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"听，你的@定制音效是这个——","color":"yellow"}]')
                    PlayAtSoundToPlayer(player)
                    return 1
                }
                )
            )
    )
})

function TellSoundList(player, color) {
    tellRaw(player, '["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"以下为可用的音效列表","color":"' + color + '"},{"text":"(点击可切换)","color":"gray"}]')
    for (let i = 0; i < soundList.length; i++) {
        let soundInfo = soundList[i]
        tellRaw(player, '["",{"text":"【@AT】","bold":true,"color":"gold"},{"text":"' + (i + 1) + '：[' + soundInfo.soundName + ']","underlined":true,"color":"' + color + '","clickEvent":{"action":"run_command","value":"/at setSound ' + i + '"}}]')
    }
}

function SetToDefault(player) {
    player.persistentData.atSound = 'minecraft:block.bell.use'
    player.persistentData.atSpeed = 1.0
}

function IsPlayerAtSettingValid(player) {
    return player.persistentData.atSound != null
}

function PlayAtSoundToPlayer(player) {
    if (!!!IsPlayerAtSettingValid(player)) {
        SetToDefault(player)
    }
    Utils.server.runCommandSilent('playsound ' + player.persistentData.atSound + ' music ' + player.toString() + ' ~ ~ ~ 100 ' + player.persistentData.atSpeed + ' 1')
}

function tellRaw(player, contex) {
    Utils.server.runCommandSilent('tellraw ' + player.toString() + " " + contex)
}
