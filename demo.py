from __future__ import absolute_import

from automation import CommandSequence, TaskManager

NUM_BROWSERS = 1
sites = ['http://www.princeton.edu']

manager_params, browser_params = TaskManager.load_default_params(NUM_BROWSERS)

browser_params[0]['http_instrument'] = True

manager_params['data_directory'] = '~/Desktop/ocsp-test-3/'
manager_params['log_directory'] = '~/Desktop/ocsp-test-3/'

manager = TaskManager.TaskManager(manager_params, browser_params)

for site in sites:
    command_sequence = CommandSequence.CommandSequence(site)
    command_sequence.get(sleep=10, timeout=60)
    manager.execute_command_sequence(command_sequence)
manager.close()
