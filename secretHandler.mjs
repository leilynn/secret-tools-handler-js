/**
 * @author github.com/leilynn irmilkh@gmail.com
 */
import { spawn as childProcessSpawn } from 'child_process'
import { createInterface as readlineCreateInputInterface } from 'readline'

/**
 * a promise that looks up a provided attribue/value pair from secret-tools
 * @param {string} attribute secret-tools attribute for secret
 * @param {string} value secret-tools value for secret
 */
let secretLookupPromise = (attribute, value) =>
    new Promise((resolutionFunc, rejectionFunc) => {
        let lookup = childProcessSpawn('secret-tool', ['lookup', attribute, value])
        lookup.on('error', (err) => {
            console.log(
                'Please install secret-tool and append it to your PATH\n' +
                'note that this only works on linux machines'
            )
            rejectionFunc(
                new Error(
                    'Please install secret-tool and append it to your PATH ' +
                    '(note that this only works on linux machines)'
                )
            )
        })
        lookup.stdout.on('data', (data) => {
            resolutionFunc(data.toString())
        })
        lookup.on('close', (code, signal) => {
            rejectionFunc(
                new Error(
                    'The provided Attribute/Value pair is not stored'
                )
            )
        })
    })

/**
 * a promise that sets up a secret in secret-tools
 * @param {string} attribute secret-tools attribute for secret
 * @param {string} value secret-tools value for secret
 * @param {string} secret the secret itself 
 */
let secretSetPromise = (attribute, value, secret) =>
    new Promise((resolutionFunc, rejectionFunc) => {
        let store = childProcessSpawn(
            'secret-tool',
            [
                'store',
                '--label=' + attribute + '-' + value,
                attribute,
                value,
            ],
        )
        store.on('error', (err) => {
            rejectionFunc(
                new Error(
                    'Please install secret-tool and append it to your PATH ' +
                    '(note that this only works on linux machines)'
                )
            )
        })
        store.stdin.write(secret)
        store.stdin.end()
        store.on('close', () => {
            resolutionFunc()
        })
    })
/**
* a promise that sets up a secret in secret-tools and reads secret from stdio
* @param {string} attribute secret-tools attribute for secret
* @param {string} value secret-tools value for secret
*/
let secretSetStdioPromise = (attribute, value) => {
    let secretLineReader = readlineCreateInputInterface({
        input: process.stdin,
        output: process.stdout,
    })
    secretLineReader.question(
        'Please enter your secret to begin with:\n' +
        "(this will be stored in your machine's keyring. you're responsible for setting up a password to encrypt it.)\n",
        (answer) => {
            let store = childProcessSpawn(
                'secret-tool',
                [
                    'store',
                    '--label=' + attribute + '-' + value,
                    attribute,
                    value,
                ]
            )
            store.stdin.write(answer)
            store.stdin.end()
            store.on('close', () => {
                console.log('store finished')
            })
            secretLineReader.close()
        }
    )
}

export { secretLookupPromise, secretSetPromise, secretSetStdioPromise }