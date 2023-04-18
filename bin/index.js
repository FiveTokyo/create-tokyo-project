#!/usr/bin/env node
// import figures from 'figures'
import logSymbols from 'log-symbols'
import download from 'download-git-repo'
import chalk from 'chalk'
import { Command } from 'commander';
import enquirer from 'inquirer';
import fs from 'fs';
import ora from 'ora';
import path from 'path';
// const { Command } = require('commander');
const prompt = enquirer.prompt
// const path = require('path');
const program = new Command();
const spinner = ora()

const choices = [
    {
        name: 'web',
        message: 'web中后台管理项目',
        templates: [{
            name: 'vite-react-web', message: '基于vite搭建的react web项目',
            github: 'github:FiveTokyo/vite-react-web'
        }]
    },
    { name: 'app', message: '手机app', templates: [{ name: 'vite-react-web', message: '基于vite搭建的react web项目', github: '' }] },
    { name: 'ssr', message: 'SSR官网', templates: [{ name: 'vite-react-web', message: '基于vite搭建的react web项目', github: '' }] },
    { name: 'electron', message: 'electron桌面端应用', templates: [{ name: 'vite-react-web', message: '基于vite搭建的react web项目', github: '' }] },
    { name: 'wx', message: 'wx微信小程序', templates: [{ name: 'vite-react-web', message: '基于vite搭建的react web项目', github: '' }] },
    { name: 'h5', message: 'h5移动端项目', templates: [{ name: 'vite-react-web', message: '基于vite搭建的react web项目', github: '' }] }
]
const args = program.version('0.0.1', '-v', '--version')
    // .option('-t, --type  <n>', '项目类型')
    .action(async (opts, { args }) => {
        // console.log('opts:', opts.type)
        let projectType = args[0];

        const findType = choices.find(config => config.name === projectType)
        if (!projectType || !findType) {
            if (!findType && projectType) console.log(chalk.red(logSymbols.warning, `没有找到 ${projectType} 项目类型！请重新选择！`))
            const answer = await prompt([
                {
                    name: 'configs',
                    message: '请选择创建所属类型项目',
                    type: 'rawlist',
                    validate: (value) => {
                        return value.length > 0 ? true : '请选择一个'
                    },
                    default: [choices[0].name],
                    choices: choices.map((config, i) => {
                        return {
                            value: config.name,
                            name: config.message,
                            // indicator: (state, choice) => {
                            //     console.log(state, choice)
                            //     return choice.enabled ? figures.checkboxOn : figures.checkboxOff
                            // },
                        }
                    }),
                },
            ])
            projectType = answer.configs
        }
        const targetType = choices.find((choice) => choice.name === projectType)

        const targetTemplateConfig = await prompt([
            {
                name: 'configs',
                message: `请选择 ${chalk.blue(targetType.message)} 项目模板`,
                type: 'rawlist',
                validate: (value) => {
                    return value.length > 0 ? true : '请选择一个'
                },
                default: [choices[0].name],
                choices: targetType.templates.map((config, i) => {
                    return {
                        value: config.name,
                        name: config.message,
                    }
                }),
            },
        ])

        const targetTemplate = targetType.templates.find(config => config.name === targetTemplateConfig.configs)

        const projectName = await prompt([
            {
                name: 'name',
                message: `请输入项目名称`,
                type: 'input',
                validate: (value) => {
                    return value.length > 0 ? true : '请输入合理的项目名称'
                },
                default: targetTemplate.name,
            },
        ])

        if (!targetTemplate.github) {
            return console.log(logSymbols.error, chalk.red('github是无效地址，请联系开发人员补充'))
        }
        try {
            const dir = path.join(process.cwd(), projectName.name);
            if (fs.existsSync(dir)) {
                console.log(chalk.red('已存在该目录文件！请删除该文件或者换个文件名'))
                return
            }
            spinner.start(`正在拉去 ${targetTemplate.github} 模板中...😎`)
            downloadTemplate({ repository: targetTemplate.github, projectName: projectName.name })
            // download(targetTemplate.github, dir, err => {
            //     if (err) {
            //         spinner.fail(logSymbols.error, chalk.red(err.message));
            //     } else {
            //         spinner.succeed(logSymbols.success, chalk.green('拉去github模板成功!😎'));
            //         console.log(chalk.gray('\n 请开始你的项目吧'))
            //         console.log(chalk.gray(`\n cd ${projectName.name} `))
            //         console.log(chalk.gray(`\n pnpm i \n `))
            //     }
            // })
        } catch (error) {
            spinner.fail(logSymbols.error, chalk.red(error.message));
        }


    }).parse(process.argv)


/**
* @description: 下载模板
* @param {type} 
* @return: 
*/
const downloadTemplate = function ({ repository, version = '0.0.2', projectName }) {
    // repository模板地址  projectName项目名称 // clone 是否是克隆
    download(repository, projectName, function (err) {
        console.log(err ? '模板加载错误' : '模板加载结束');
        if (err !== 'Error') {
            editFile({ version, projectName });
        }
    })
};

const editFile = function ({ version, projectName }) {
    try {
        // 读取文件
        fs.readFile(`${process.cwd()}/${projectName}/package.json`, (err, data) => {
            if (err) throw err;
            // 获取json数据并修改项目名称和版本号
            let _data = JSON.parse(data.toString())
            _data.name = projectName
            _data.version = version
            let str = JSON.stringify(_data, null, 4);
            // 写入文件
            fs.writeFile(`${process.cwd()}/${projectName}/package.json`, str, function (err) {
                if (err) throw err;
            })
            spinner.succeed(logSymbols.success, chalk.green('拉去github模板成功!😎'));
            console.log(chalk.gray('\n 请开始你的项目吧'))
            console.log(chalk.gray(`\n cd ${projectName.name} `))
            console.log(chalk.gray(`\n pnpm i \n `))
        });
    } catch (error) {
        console.log(logSymbols.error, chalk.red('\n 修改文件失败', error.message))
    }

};



