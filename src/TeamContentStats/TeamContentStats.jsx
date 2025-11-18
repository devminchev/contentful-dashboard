/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Datepicker, FormControl, Select } from '@contentful/f36-components';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getMembersIdInfos } from '../services/ManagementApi';
import pause from '../utils/pause';
import LoadingBar from '../common/components/LoadingBar/LoadingBar';
import { ListItemBtn, PageWrapper, RowWrapper } from '../common/styles/mixins';
import { RefreshBtn } from '../AtoZSectionsGames/AtoZSectionsGames.style';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const dateFilterQueryFormat = (value) => {
    const inputDate = new Date(value);
    return inputDate.toISOString().split('T')[0] + 'T00:00:00';
};

function generateContinuousLabels(dateFrom, dateTo, period) {
    const labels = [];
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    if (period === 'week') {
        const dayOfWeek = start.getDay(); // 0=Sunday,1=Monday, etc.
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start.setDate(start.getDate() - diffToMonday);
    }

    while (start <= end) {
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const date = String(start.getDate()).padStart(2, '0');

        let label = `${year}-${month}-${date}`;

        if (period === 'month') {
            label = `${year}-${month}`;
        } else if (period === 'week') {
            label = `${year}-${month}-${date}`;
        }
        labels.push(label);

        if (period === 'day') {
            start.setDate(start.getDate() + 1);
        } else if (period === 'week') {
            start.setDate(start.getDate() + 7);
        } else if (period === 'month') {
            start.setMonth(start.getMonth() + 1);
        }
    }

    return labels;
};
function groupItemsByPeriod(items, period = 'day') {
    const resultMap = {};

    items.forEach((item) => {
        const dateStr = item.sys.updatedAt;
        const dateObj = new Date(dateStr);

        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const date = dateObj.getDate();

        let groupKey = '';

        switch (period) {
            case 'day':
            default:
                groupKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                break;
            case 'week': {
                const dayOfWeek = dateObj.getDay(); // 0=Sun,1=Mon,...6=Sat
                const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const monday = new Date(dateObj);
                monday.setDate(monday.getDate() - diffToMonday);
                groupKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(
                    monday.getDate()
                ).padStart(2, '0')}`;
                break;
            }
            case 'month':
                groupKey = `${year}-${String(month + 1).padStart(2, '0')}`;
                break;
        }

        if (!resultMap[groupKey]) {
            resultMap[groupKey] = 0;
        }
        resultMap[groupKey]++;
    });

    return resultMap;
};

async function fetchAllEntries(client, baseQuery) {
    let allItems = [];
    let skip = 0;
    const limit = 1000;

    while (true) {
        const response = await client.getMany({
            query: {
                ...baseQuery,
                skip,
                limit,
            },
        });
        allItems = allItems.concat(response.items);
        if (allItems.length >= response.total) {
            break;
        }
        skip += limit;
    }

    return allItems;
}

const TeamContentStats = () => {
    const { cma } = useSDK();

    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedTeamName, setSelectedTeamName] = useState('');
    const [selectedTeamUserIds, setSelectedTeamUserIds] = useState('');
    const [selectedDateFrom, setSelectedDateFrom] = useState(new Date());
    const [selectedDateTo, setSelectedDateTo] = useState(new Date());
    const [updatedItems, setUpdatedItems] = useState([]);
    const [publishedItems, setPublishedItems] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('day');

    useEffect(() => {
        const loadTeams = async () => {
            const { items: teamList } = await cma.team.getManyForSpace();
            setTeams(teamList);
        };
        loadTeams();
    }, []);

    const fetchUpdatedContent = async (teamUsers, dateFrom, dateTo) => {
        return fetchAllEntries(cma.entry, {
            // content_type: 'siteGameV2',
            'sys.updatedBy.sys.id[in]': teamUsers,
            'sys.updatedAt[gte]': dateFrom,
            'sys.updatedAt[lt]': dateTo,
        });
    };

    const fetchPublishedContent = async (teamUsers, dateFrom, dateTo) => {
        return fetchAllEntries(cma.entry, {
            // content_type: 'siteGameV2',
            'sys.publishedBy.sys.id[in]': teamUsers,
            'sys.updatedAt[gte]': dateFrom,
            'sys.updatedAt[lt]': dateTo,
        });
    };

    const onTeamChangeHandler = async (event) => {
        const teamId = event.target.value;
        const teamName = event.target.options[event.target.selectedIndex].text;

        setSelectedTeam(teamId);
        setSelectedTeamName(teamName);

        if (!teamId) {
            setSelectedTeamUserIds('');
            return;
        };
        const membersIdInfos = await getMembersIdInfos(teamId);
        const merberIdsQuery = membersIdInfos.map((m) => m.sys.user.sys.id).join(',');
        setSelectedTeamUserIds(merberIdsQuery);
    };

    const fetchAllData = useCallback(async () => {
        if (!selectedTeamUserIds) {
            return;
        };
        setLoading(true);
        const dateFromStr = dateFilterQueryFormat(selectedDateFrom);
        const dateToStr = dateFilterQueryFormat(selectedDateTo);
        const updatedResp = await fetchUpdatedContent(selectedTeamUserIds, dateFromStr, dateToStr);
        await pause(500);

        const publishedResp = await fetchPublishedContent(selectedTeamUserIds, dateFromStr, dateToStr);

        setUpdatedItems(updatedResp || []);
        setPublishedItems(publishedResp || []);
        setLoading(false);
    }, [selectedTeamUserIds, selectedDateFrom, selectedDateTo, cma.entry]);

    const generateChartData = (updatedMap, publishedMap, labels) => {
        const updatedData = labels.map((label) => updatedMap[label] || 0);
        const publishedData = labels.map((label) => publishedMap[label] || 0);

        return {
            labels,
            datasets: [
                {
                    label: `Updated (${selectedPeriod})`,
                    data: updatedData,
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    tension: 0.3,
                },
                {
                    label: `Published (${selectedPeriod})`,
                    data: publishedData,
                    borderColor: 'rgba(192,75,75,1)',
                    backgroundColor: 'rgba(192,75,75,0.2)',
                    tension: 0.3,
                },
            ],
        };
    };

    const exportToCSV = () => {
        if (!chartData) return;
        const { labels, datasets } = chartData;
        const updatedValues = datasets[0].data;
        const publishedValues = datasets[1].data;
        let csvStr = 'Date,Updated,Published\n';
        labels.forEach((dateLabel, idx) => {
            csvStr += `${dateLabel},${updatedValues[idx]},${publishedValues[idx]}\n`;
        });
        const blob = new Blob([csvStr], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'team_content_stats.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (!updatedItems.length && !publishedItems.length) {
            setChartData(null);
            return;
        };
        const updatedMap = groupItemsByPeriod(updatedItems, selectedPeriod);
        const publishedMap = groupItemsByPeriod(publishedItems, selectedPeriod);
        const allLabels = generateContinuousLabels(selectedDateFrom, selectedDateTo, selectedPeriod);
        const newChartData = generateChartData(updatedMap, publishedMap, allLabels);
        setChartData(newChartData);
    }, [updatedItems, publishedItems, selectedPeriod, selectedDateFrom, selectedDateTo]);

    const requiredFieldsFilled = Boolean(selectedTeam && selectedDateFrom && selectedDateTo);
    const hasChartData = chartData && chartData.labels.length > 0;

    return (
        <PageWrapper>
            <h1>Team Reports</h1>

            <RowWrapper>
                <FormControl id="dateFrom" isRequired style={{ width: '100%', margin: '5px' }}>
                    <FormControl.Label style={{ color: '#fff' }}>Date - FROM</FormControl.Label>
                    <Datepicker
                        dateFormat="dd-MM-yyyy"
                        selected={selectedDateFrom}
                        onSelect={setSelectedDateFrom}
                    />
                </FormControl>

                <FormControl id="dateTo" isRequired style={{ width: '100%', margin: '5px' }}>
                    <FormControl.Label style={{ color: '#fff' }}>Date - TO</FormControl.Label>
                    <Datepicker
                        dateFormat="dd-MM-yyyy"
                        selected={selectedDateTo}
                        onSelect={setSelectedDateTo}
                    />
                </FormControl>

                <FormControl id="team" isRequired style={{ width: '100%', margin: '5px' }}>
                    <FormControl.Label style={{ color: '#fff' }}>
                        Select Team
                    </FormControl.Label>
                    <Select
                        id="team"
                        name="team"
                        value={selectedTeam}
                        onChange={onTeamChangeHandler}
                    >
                        <Select.Option key="none" value="">
                            Select a team
                        </Select.Option>
                        {teams.map((option) => (
                            <Select.Option key={option.sys.id} value={option.sys.id}>
                                {option.name}
                            </Select.Option>
                        ))}
                    </Select>
                </FormControl>
            </RowWrapper>
            <RowWrapper style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                <RefreshBtn onClick={fetchAllData} disabled={!requiredFieldsFilled}>
                    Load Report Data
                </RefreshBtn>
            </RowWrapper>

            <RowWrapper style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>

                <ListItemBtn
                    onClick={() => setSelectedPeriod('day')}
                    disabled={!hasChartData}
                    className={hasChartData && selectedPeriod === 'day' ? 'active' : ''}
                >
                    Show Daily
                </ListItemBtn>
                <ListItemBtn
                    onClick={() => setSelectedPeriod('week')}
                    disabled={!hasChartData}
                    className={hasChartData && selectedPeriod === 'week' ? 'active' : ''}
                >
                    Show Weekly
                </ListItemBtn>
                <ListItemBtn
                    onClick={() => setSelectedPeriod('month')}
                    disabled={!hasChartData}
                    className={hasChartData && selectedPeriod === 'month' ? 'active' : ''}
                >
                    Show Monthly
                </ListItemBtn>

                <ListItemBtn
                    onClick={exportToCSV}
                    disabled={!hasChartData}
                >
                    Export to CSV
                </ListItemBtn>
            </RowWrapper>

            {loading && <LoadingBar />}

            {!loading && chartData && (
                <>
                    <div style={{ marginTop: '20px', width: 'auto', padding: '50px' }}>
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: {
                                        display: true,
                                        text: `${selectedTeamName} Team Report`,
                                        font: { size: 32 },
                                        color: '#fff',
                                    },
                                },
                            }}
                        />
                    </div>
                    <div style={{ marginTop: '20px', width: 'auto', padding: '50px' }}>
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: {
                                        display: true,
                                        text: `${selectedTeamName} Team Report`,
                                        font: { size: 32 },
                                        color: '#fff',
                                    },
                                },
                            }}
                        />
                    </div>
                </>
            )}

        </PageWrapper>
    );
};

export default TeamContentStats;
