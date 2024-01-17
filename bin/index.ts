#!/usr/bin/env node

import yargs from "yargs";
import { exit } from "process";
import { config } from "dotenv";
import { hideBin } from "yargs/helpers";
import prisma from "../src/prisma/prisma";
import chalk from "chalk";
config();

yargs(hideBin(process.argv))
	.command(
		"create-admin",
		"Create a new user",
		() => {
			return yargs.options({
				fname: {
					describe: "first name of the admin",
					type: "string",
					alias: "f",
					demandOption: true,
				},
				lname: {
					describe: "last name of the admin",
					type: "string",
					alias: "l",
					demandOption: false,
				},
				email: {
					describe: "Email of the admin",
					type: "string",
					alias: "e",
					demandOption: true,
				},
				phone: {
					describe: "Phone number of the admin",
					type: "string",
					alias: "p",
					demandOption: true,
				},
				password: {
					describe: "Password of the admin",
					type: "string",
					alias: "s",
					demandOption: true,
				},
			});
		},
		async (args: any) => {
			try {
				await prisma.$connect();

				await prisma.user.create({
					data: {
						email: args.email,
						fName: args.fname,
						lName: args.lname,
						phone: +args.phone,
						password: args.password,
						role: "SUPERADMIN",
					},
				});

				console.log(chalk.green("Admin created successfully"));
			} catch (error: any) {
				if (error.code === 11000) {
					return console.log(
						chalk.red("Admin with same email or phone already exists")
					);
				}

				console.log(error);
				console.log(chalk.red("Something went wrong"));
			} finally {
				exit(1);
			}
		}
	)
	.parse();
